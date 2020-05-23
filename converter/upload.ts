import { atob } from '../backend/util'
import { BigQuery } from '@google-cloud/bigquery'
import dotenv from 'dotenv'
import path from 'path'
dotenv.config()

const bigqueryClient = new BigQuery({
  projectId: process.env.GCLOUD_PROJECT_ID,
  credentials: {
    private_key: atob(process.env.GCLOUD_PRIVATE_KEY_BASE64!),
    client_email: process.env.GCLOUD_SERVICE_EMAIL,
  },
})

const upload = async (lang: string, table: 'pages' | 'pagelinks') => {
  console.log(`Uploading ${table}_${lang}.csv...`)

  const filename = path.join(__dirname, '..', `${table}_${lang}.csv`)
  const [job] = await bigqueryClient
    .dataset(`wikigolf_${lang}`)
    .table(table)
    .load(filename, {
      rangePartitioning:
        table === 'pagelinks'
          ? {
              field: 'id_from',
              range: { start: '1', end: '100000000', interval: '50000' },
            }
          : undefined,
      clustering: table === 'pagelinks' ? { fields: ['id_from'] } : undefined,
      sourceFormat: 'CSV',
      maxBadRecords: 1000,
      schema: { fields: table === 'pages' ? PAGES_SCHEMA : PAGELINKS_SCHEMA },
      writeDisposition: 'WRITE_TRUNCATE',
    })

  console.log(`Uploading ${table}_${lang}.csv completed, ${job.id}`)

  // Check the job's status for errors
  const errors = job.status?.errors ?? []
  if (errors.length > 0) {
    throw errors
  }
}

const PAGELINKS_SCHEMA = [
  { name: 'id_from', type: 'integer', mode: 'REQUIRED' },
  { name: 'id_to', type: 'integer', mode: 'REQUIRED' },
]
const PAGES_SCHEMA = [
  { name: 'id', type: 'integer', mode: 'REQUIRED' },
  { name: 'name', type: 'string', mode: 'REQUIRED' },
]

const LANG = process.argv[2]

if (!['fi', 'en'].includes(LANG))
  throw new Error(`Language ${LANG} not supported!`)

console.log(`Uploading ${LANG} wikipedia pages and pagelinks to BigQuery...`)
upload(LANG, 'pages')
upload(LANG, 'pagelinks')
