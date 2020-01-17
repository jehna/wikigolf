import { atob } from './util'
import { BigQuery } from '@google-cloud/bigquery'

const bigqueryClient = new BigQuery({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    private_key: atob(process.env.GCLOUD_PRIVATE_KEY_BASE64!),
    client_email: process.env.GCLOUD_SERVICE_EMAIL
  }
})

const query = (fromPage: string, toPage: string, loacle: string) => `WITH
  q1 AS (SELECT name as s1, name_to as s2, '' as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_${loacle}.pagelinks LEFT JOIN wikigolf_${loacle}.pages ON (id_from = id) WHERE name = "${fromPage}"),
  q2 AS (SELECT s1, s2, name_to as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_${loacle}.pagelinks LEFT JOIN wikigolf_${loacle}.pages ON (id_from = id) RIGHT JOIN q1 ON (name = s2)),
  q3 AS (SELECT s1, s2, s3, name_to as s4, '' as s5, '' as s6 FROM wikigolf_${loacle}.pagelinks LEFT JOIN wikigolf_${loacle}.pages ON (id_from = id) RIGHT JOIN q2 ON (name = s3)),
  q4 AS (SELECT s1, s2, s3, s4, name_to as s5, '' as s6 FROM wikigolf_${loacle}.pagelinks LEFT JOIN wikigolf_${loacle}.pages ON (id_from = id) RIGHT JOIN q3 ON (name = s4)),
  q5 AS (SELECT s1, s2, s3, s4, s5, name_to as s6 FROM wikigolf_${loacle}.pagelinks LEFT JOIN wikigolf_${loacle}.pages ON (id_from = id) RIGHT JOIN q4 ON (name = s5))

SELECT COALESCE(
  (SELECT AS STRUCT * FROM q1 WHERE s2 = "${toPage}" LIMIT 1),
  (SELECT AS STRUCT * FROM q2 WHERE s3 = "${toPage}" LIMIT 1),
  (SELECT AS STRUCT * FROM q3 WHERE s4 = "${toPage}" LIMIT 1),
  (SELECT AS STRUCT * FROM q4 WHERE s5 = "${toPage}" LIMIT 1),
  (SELECT AS STRUCT * FROM q5 WHERE s6 = "${toPage}" LIMIT 1)
);`

export async function getShortestRoute(
  fromPage: string,
  toPage: string,
  loacle: string
): Promise<string[] | null> {
  const options = {
    query: query(fromPage, toPage, loacle),
    location: 'US'
  }

  const [job] = await bigqueryClient.createQueryJob(options)
  const [[{ f0_: result }]] = await job.getQueryResults()

  return result ? formatResult(result) : null
}

const formatResult = (results: { [key: string]: string }) =>
  Object.values(results)
    .filter(Boolean)
    .map(res => res.slice(1, -1))
