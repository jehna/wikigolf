require('core-js/proposals/iterator-helpers')
const fs = require('fs')
const zlib = require('zlib')
const DelimiterStream = require('delimiter-stream')
const { Parser } = require('node-sql-parser')
const https = require('https')
const csv = require('csv')
const get = url => new Promise(resolve => https.get(url, resolve))

const INSERT_LINE_BUFFER = Buffer.from('INSERT')

const pagelinksUrl = locale =>
  `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-pagelinks.sql.gz`
const pagesUrl = locale =>
  `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-page.sql.gz`

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
  let n = 0
  const input = await get(pagelinksUrl(locale))
  const output = fs.createWriteStream(`./pagelinks_${locale}.tsv`)
  const gunzip = zlib.createGunzip()
  input.pipe(gunzip)
  const tsvizer = csv.stringify({delimiter: '\t'})
  tsvizer.pipe(output)

  await getSqlInsertDataFromStream(gunzip)
    .filter(([, namespace]) => namespace === 0)
    .forEach(([from, , title]) => {
      if (++n % 100000 === 0) console.log(`PageLinks rows written: ${n}`)

      tsvizer.write([from, title])
    })
}

const readPages = async locale => {
  let n = 0
  const input = await get(pagesUrl(locale))
  const output = fs.createWriteStream(`./pages_${locale}.tsv`)
  const gunzip = zlib.createGunzip()
  input.pipe(gunzip)
  const tsvizer = csv.stringify({delimiter: '\t'})
  tsvizer.pipe(output)

  await getSqlInsertDataFromStream(gunzip)
    .filter(([, namespace]) => namespace === 0)
    .forEach(([id, , name]) => {
      if (++n % 100000 === 0) console.log(`Pages rows written: ${n}`)

      tsvizer.write([id, name])
    })
}

const LANG = process.argv[2]

if (!['fi', 'en'].includes(LANG))
  throw new Error(`Language ${LANG} not supported!`)

console.log(`Loading ${LANG} wikipedia pages and pagelinks...`)

;(async () => {
  await readPagelinks(LANG)
  await readPages(LANG)
})()

