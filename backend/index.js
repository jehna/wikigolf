const { BigQuery } = require('@google-cloud/bigquery')

const bigqueryClient = new BigQuery()

const fromPage = 'Hitler'
const toPage = 'JavaScript'

const query = `WITH
  q1 AS (SELECT name as s1, name_to as s2, '' as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) WHERE name = "'${fromPage}'"),
  q2 AS (SELECT s1, s2, name_to as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q1 ON (name = s2)),
  q3 AS (SELECT s1, s2, s3, name_to as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q2 ON (name = s3)),
  q4 AS (SELECT s1, s2, s3, s4, name_to as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q3 ON (name = s4)),
  q5 AS (SELECT s1, s2, s3, s4, s5, name_to as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q4 ON (name = s5))

SELECT COALESCE(
  (SELECT AS STRUCT * FROM q1 WHERE s2 = "'${toPage}'" LIMIT 1),
  (SELECT AS STRUCT * FROM q2 WHERE s3 = "'${toPage}'" LIMIT 1),
  (SELECT AS STRUCT * FROM q3 WHERE s4 = "'${toPage}'" LIMIT 1),
  (SELECT AS STRUCT * FROM q4 WHERE s5 = "'${toPage}'" LIMIT 1),
  (SELECT AS STRUCT * FROM q5 WHERE s6 = "'${toPage}'" LIMIT 1)
);`

const options = {
  query: query,
  location: 'US'
}

exports.get = (req, res) => {
  res.send('Hello World!')
}

/*
// Run the query as a job
const [job] = await bigqueryClient.createQueryJob(options)

// Wait for the query to finish
const [rows] = await job.getQueryResults()

// Print the results
console.log('Rows:')
rows.forEach(row => console.log(row))
*/
