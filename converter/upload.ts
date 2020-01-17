import { atob } from '../backend/util'
import { BigQuery } from '@google-cloud/bigquery'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const bigqueryClient = new BigQuery({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    private_key: atob(process.env.GCLOUD_PRIVATE_KEY_BASE64!),
    client_email: process.env.GCLOUD_SERVICE_EMAIL
  }
})

const upload = async (lang: string, table: 'pages' | 'pagelinks') => {
  console.log(`Uploading ${table}_${lang}.ndjson...`)

  const filename = path.join(__dirname, '..', `${table}_${lang}.ndjson`)
  const [job] = await bigqueryClient
    .dataset(`wikigolf_${lang}`)
    .table(table)
    .load(filename, { format: 'NEWLINE_DELIMITED_JSON' })

  console.log(`Uploading ${table}_${lang}.ndjson completed, ${job.id}`)

  // Check the job's status for errors
  const errors = job.status?.errors ?? []
  if (errors.length > 0) {
    throw errors
  }
}

const LANG = process.argv[2]

if (!['fi', 'en'].includes(LANG))
  throw new Error(`Language ${LANG} not supported!`)

console.log(`Uploading ${LANG} wikipedia pages and pagelinks to BigQuery...`)
upload(LANG, 'pages')
upload(LANG, 'pagelinks')
