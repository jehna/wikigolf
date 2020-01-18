require('core-js/proposals/iterator-helpers')

module.exports = function fromSql(line) {
  const [,afterValues] = /VALUES (.*)/i.exec(line)
  const blocks = /\((((('([^']|\\')*(?<!\\)')|([^,)]+)),? *)+)\)/g
  const values = /((?:'([^']|(?<!\\)\\')*(?<!\\)')|(?:[^,)]+)),?\s*/g

  const bs = [...afterValues.matchAll(blocks).map(([,v]) => v)]
  return bs.map(v => [...v.matchAll(values).map(([,v])=> v).map(v => v === 'NULL' ? null : eval(v))])
}