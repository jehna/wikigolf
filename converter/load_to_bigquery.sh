set -e

LANG=$1

node ./converter/download-and-convert.js
bq load "wikigolf:wikigolf_$LANG.pages" "./pages_$LANG.tsv" ./pages_schema.json
bq load "wikigolf:wikigolf_$LANG.pagelinkgs" "./pagelinks_$LANG.tsv" ./pagelinks_schema.json