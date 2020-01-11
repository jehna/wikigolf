require('core-js/proposals/iterator-helpers')
const fs = require('fs')
const zlib = require("zlib")
const DelimiterStream = require('delimiter-stream')
const { Parser } = require('node-sql-parser')
const https = require('https')
const get = url => new Promise(resolve => https.get(url, resolve))

const INSERT_LINE_BUFFER = Buffer.from('INSERT')

const pagelinksUrl = locale => `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-pagelinks.sql.gz`
const pagesUrl = locale => `https://dumps.wikimedia.your.org/${locale}wiki/latest/${locale}wiki-latest-page.sql.gz`

const getSqlInsertDataFromStream = (stream) => {
  const parser = new Parser()
  const lineByLineStream = new DelimiterStream()
  stream.pipe(lineByLineStream)

  return AsyncIterator.from(lineByLineStream)
    .filter(data => data.slice(0, 6).compare(INSERT_LINE_BUFFER) === 0)
    .map(data => data.toString('utf-8'))
    .flatMap(line => parser.astify(line))
    .flatMap(({ values }) => values)
    .map(({ value }) => value.map(v => v.value))
}

const readPagelinks = async (locale) => {
  let n = 0
  const input = await get(pagelinksUrl(locale))
  const output = fs.createWriteStream(`./pagelinks_${locale}.tsv`)
  const gunzip = zlib.createGunzip()
  input.pipe(gunzip)

  getSqlInsertDataFromStream(gunzip)
    .filter(([, namespace]) => namespace === 0)
    .forEach(([from, , title]) => {

      if (n++) output.write('\n')
      if (n % 100000 === 0) console.log(`PageLinks rows written: ${n}`)

      output.write([from, title].join('\t'))
    })
}

const readPages = async (locale) => {
  let n = 0
  const input = await get(pagesUrl(locale))
  const output = fs.createWriteStream(`./pages_${locale}.tsv`)
  const gunzip = zlib.createGunzip()
  input.pipe(gunzip)

  getSqlInsertDataFromStream(gunzip)
    .filter(([, namespace]) => namespace === 0)
    .forEach(([id, , title]) => {
      if (n++) output.write('\n')
      if (n % 100000 === 0) console.log(`Pages rows written: ${n}`)

      output.write([id, title].join('\t'))
    })
}

readPages('en')
