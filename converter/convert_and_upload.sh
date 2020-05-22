#!/bin/bash

set -euo pipefail

LANG=${1:-"fi"}

read -r -p "Download fresh data? (y/N) " load_fresh_data
if [ "$load_fresh_data" == "y" ] ;then
  echo "Downloading fresh data..."
  curl "https://dumps.wikimedia.org/${LANG}wiki/latest/${LANG}wiki-latest-page.sql.gz" | zcat > "../${LANG}wiki-latest-page.sql"
  curl "https://dumps.wikimedia.org/${LANG}wiki/latest/${LANG}wiki-latest-pagelinks.sql.gz" | zcat > "../${LANG}wiki-latest-pagelinks.sql"
  echo "Done!"
fi

cd rust-converter
cargo build --release

echo "Parsing..."
./target/release/rust-wiki-link-parser "../../" "$LANG"
echo "Done!"

yarn ts-node ./converter/upload.ts "$LANG"