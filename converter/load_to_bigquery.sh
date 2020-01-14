set -e

LANG=$1

node ./converter/download-and-convert.js $LANG pagelinks &&
node ./converter/download-and-convert.js $LANG pages &&
yarn ts-node  ./converter/upload.ts $LANG