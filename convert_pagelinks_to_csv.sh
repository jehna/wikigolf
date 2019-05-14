FILE=fiwiki-latest-pagelinks.sql
#head -n 50 $FILE | # For debugging
cat $FILE |
sed $'s/^INSERT INTO `pagelinks` VALUES (//; s/),(/\\\n/g' |
awk -F ',' 'NR > 40 && $2 == 0 { print $0 }' |
sed $'s/,0,/,/; s/\',0.*$/\'/'