FILE=fiwiki-latest-page.sql
# head -n 100 $FILE | # For debugging
cat $FILE |
sed $'s/^INSERT INTO `page` VALUES (//; s/),(/\\\n/g' |
awk -F ',' 'NR > 52 { print $1","$3 }'