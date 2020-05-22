import { atob } from './util'
import { BigQuery } from '@google-cloud/bigquery'

const bigqueryClient = new BigQuery({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    private_key: atob(process.env.GCLOUD_PRIVATE_KEY_BASE64!),
    client_email: process.env.GCLOUD_SERVICE_EMAIL,
  },
})

const query = (fromPage: string, toPage: string, locale: string) => `
WITH
  from_id AS (SELECT id FROM wikigolf_${locale}.pages WHERE name = "${fromPage}"),
  to_id AS (SELECT id FROM wikigolf_${locale}.pages WHERE name = "${toPage}"),

  q1 AS (SELECT id_to as s1, -1 as s2, -1 as s3, -1 as s4, -1 as s5 FROM from_id LEFT JOIN wikigolf_${locale}.pagelinks ON (id_from = id)),
  q2 AS (SELECT s1, id_to as s2, -1 as s3, -1 as s4, -1 as s5 FROM q1 LEFT JOIN wikigolf_${locale}.pagelinks ON (s1 = id_from)),
  q3 AS (SELECT s1, s2, id_to as s3, -1 as s4, -1 as s5 FROM q2 LEFT JOIN wikigolf_${locale}.pagelinks ON (s2 = id_from)),
  q4 AS (SELECT s1, s2, s3, id_to as s4, -1 as s5 FROM q3 LEFT JOIN wikigolf_${locale}.pagelinks ON (s3 = id_from)),
  q5 AS (SELECT s1, s2, s3, s4, id_to as s5 FROM q4 LEFT JOIN wikigolf_${locale}.pagelinks ON (s4 = id_from)),

  result AS (SELECT COALESCE(
    (SELECT AS STRUCT * FROM q1 WHERE s1 = (SELECT id FROM to_id) LIMIT 1),
    (SELECT AS STRUCT * FROM q2 WHERE s2 = (SELECT id FROM to_id) LIMIT 1),
    (SELECT AS STRUCT * FROM q3 WHERE s3 = (SELECT id FROM to_id) LIMIT 1),
    (SELECT AS STRUCT * FROM q4 WHERE s4 = (SELECT id FROM to_id) LIMIT 1),
    (SELECT AS STRUCT * FROM q5 WHERE s5 = (SELECT id FROM to_id) LIMIT 1)
  ) as res)

SELECT
  r1.name as s1,
  r2.name as s2,
  r3.name as s3,
  r4.name as s4,
  r5.name as s5
FROM result
LEFT JOIN wikigolf_${locale}.pages r1 ON (res.s1 = r1.id)
LEFT JOIN wikigolf_${locale}.pages r2 ON (res.s2 = r2.id)
LEFT JOIN wikigolf_${locale}.pages r3 ON (res.s3 = r3.id)
LEFT JOIN wikigolf_${locale}.pages r4 ON (res.s4 = r4.id)
LEFT JOIN wikigolf_${locale}.pages r5 ON (res.s5 = r5.id);`

export async function getShortestRoute(
  fromPage: string,
  toPage: string,
  locale: string
): Promise<string[] | null> {
  const options = {
    query: query(fromPage, toPage, locale),
    location: 'US',
  }

  const [[result]] = await bigqueryClient.query(options)

  return result ? [fromPage, ...formatResult(result)] : null
}

const formatResult = (results: { [key: string]: string }) =>
  Object.values(results).filter(Boolean)
