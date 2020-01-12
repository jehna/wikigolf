set -e

LANG=$1

node ./converter/download-and-convert.js $LANG &&
yarn ts-node ./converter/upload.ts $LANG