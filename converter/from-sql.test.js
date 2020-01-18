const fromSql = require('./from-sql')
const knex = require('knex')({client: 'mysql'})
const fc = require('fast-check');

describe('fromSql', () => {
  it('should return correct value with single insert', () => {
    expect(fromSql('INSERT INTO foo VALUES (1,2,3)')).toEqual([[1,2,3]])
  })

  it('should return correct value with multiple inserts', () => {
    expect(fromSql('INSERT INTO foo VALUES (1,2,3), (4,5,6), (7,8,9)')).toEqual([[1,2,3],[4,5,6],[7,8,9]])
  })

  it('should work with knex-escaped values', () => {
    const data = [[1,2,3]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with multiple knex-escaped values', () => {
    const data = [[1,2,3], [4,5,6]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with backtick characters', () => {
    const data = [['','','\\']]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a null char', () => {
    const data = [["\0"]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a paren char', () => {
    const data = [["", ")", ""]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a comma char', () => {
    const data = [[",", ""]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a \' char', () => {
    const data = [["'", ""]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a )\' char', () => {
    const data = [[")'"]]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with a \\ char followed by empty', () => {
    const data = [['\\','']]
    expect(fromSql(knex('table').insert(data).toQuery())).toEqual(data)
  })

  it('should work with property-based fuzzing', () => {
    fc.assert(
      fc.property(fc.fullUnicodeString(), fc.fullUnicodeString(), fc.fullUnicodeString(), (a, b, c) => {
        const data = [{a,b,c}]
        const output = [[a,b,c]]
        expect(fromSql(knex('table').insert(data).toQuery())).toEqual(output)
      }),
      { numRuns: 1000 }
    );
  })
})