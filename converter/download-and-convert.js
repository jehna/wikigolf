require('core-js/proposals/iterator-helpers')
const fs = require('fs')
const zlib = require('zlib')
const DelimiterStream = require('delimiter-stream')
const { Parser } = require('node-sql-parser')
const https = require('https')
const get = url => new Promise(resolve => https.get(url, resolve))

const heartbeat = () => get('https://wikigolf1.herokuapp.com/keepalive')

const INSERT_LINE_BUFFER = Buffer.from('INSERT')

const pagelinksUrl = locale =>
  `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-pagelinks.sql.gz`
const pagesUrl = locale =>
  `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-page.sql.gz`

const tmpFilename = () => `/tmp/wikigolf-${Date.now()}${~(Math.random()*1e9)}`
const downloadGzippedToTmpFile = url => new Promise(async (resolve, reject) => {
  const randomFilename = tmpFilename()
  const output = fs.createWriteStream(randomFilename)
  const input =  await get(url)
  const gunzip = zlib.createGunzip()

  let downloadedBytes = 0
  input.on('data', d => downloadedBytes += d.length)
  const logger = setInterval(() => console.log(`${Math.round(downloadedBytes/1024/1024)}mb downloaded`), 1000 * 10)

  const stream = input.pipe(gunzip).pipe(output)
  stream.on('error', reject)
  input.on('end', () => {
    console.log('Done!')
    clearInterval(logger)
    resolve(randomFilename)
  })

  console.log(`Downloading ${url} to ${randomFilename} ...`)
})

const getSqlInsertDataFromStream = stream => {
  const parser = new Parser()
  const lineByLineStream = new DelimiterStream()
  stream.pipe(lineByLineStream)

  return AsyncIterator.from(lineByLineStream)
    .map(v => {
      lineByLineStream.pause()
      return v
    })
    .filter(data => data.slice(0, 6).compare(INSERT_LINE_BUFFER) === 0)
    .map(data => data.toString('utf-8'))
    .flatMap(line => parser.astify(line))
    .flatMap(({ values }) => values)
    .map(({ value }) => value.map(v => v.value))
    .map(v => {
      lineByLineStream.resume()
      return v
    })
}

const readPagelinks = async locale => {
  const inputFile = await downloadGzippedToTmpFile(pagelinksUrl(locale))
  const input = fs.createReadStream(inputFile)

  let n = 0
  const output = fs.createWriteStream(`./pagelinks_${locale}.ndjson`)

  console.log('Starting to stream pagelinks to ndjson file...')
  await getSqlInsertDataFromStream(input)
    .filter(([, namespace]) => namespace === 0)
    .forEach(async ([from, , title]) => {
      if (++n % 100000 === 0) console.log(`PageLinks rows written: ${n}`)
      if (n > 0) output.write('\n')

      output.write(JSON.stringify({ from, title }))
      if (n % 500000 === 0) await heartbeat()
    })
  console.log('Done!')
}

const readPages = async locale => {
  const inputFile = await downloadGzippedToTmpFile(pagesUrl(locale))
  const input = fs.createReadStream(inputFile)

  let n = 0
  const output = fs.createWriteStream(`./pages_${locale}.ndjson`)

  console.log('Starting to stream pages to ndjson file...')
  await getSqlInsertDataFromStream(input)
    .filter(([, namespace]) => namespace === 0)
    .forEach(async ([id, , name]) => {
      if (++n % 100000 === 0) console.log(`Pages rows written: ${n}`)
      if (n > 0) output.write('\n')

      output.write(JSON.stringify({ id, name }))
      if (n % 500000 === 0) await heartbeat()
    })
  console.log('Done!')
}

const LANG = process.argv[2]
const CMD = process.argv[3]

if (!['fi', 'en'].includes(LANG))
  throw new Error(`Language ${LANG} not supported!`)

if (!['pages', 'pagelinks'].includes(CMD))
  throw new Error(`Command ${CMD} not supported!`)

if (CMD === 'pages') readPages(LANG)
if (CMD === 'pagelinks') readPagelinks(LANG)

