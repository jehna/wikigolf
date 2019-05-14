FILE=fiwiki-latest-page.sql
# head -n 100 $FILE | # For debugging
cat $FILE |
sed $'s/^INSERT INTO `page` VALUES (//; s/),(/\\\n/g' |
awk -F ',' 'NR > 51 && $2 == 0 { print $0 }' |
awk -F $'\'' $'{ print $1"\'"$2"\'" }' |
sed $'s/,0,/,/; s/,/\t/'