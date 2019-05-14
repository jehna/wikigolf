CREATE TEMP FUNCTION from_page() AS ("'Adolf_Hitler'");
CREATE TEMP FUNCTION to_page() AS ("'JavaScript'");

WITH
  q1 AS (SELECT name as s1, name_to as s2, '' as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) WHERE name = from_page()),
  q2 AS (SELECT s1, s2, name_to as s3, '' as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q1 ON (name = s2)),
  q3 AS (SELECT s1, s2, s3, name_to as s4, '' as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q2 ON (name = s3)),
  q4 AS (SELECT s1, s2, s3, s4, name_to as s5, '' as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q3 ON (name = s4)),
  q5 AS (SELECT s1, s2, s3, s4, s5, name_to as s6 FROM wikigolf_fi.pagelinks LEFT JOIN wikigolf_fi.pages ON (id_from = id) RIGHT JOIN q4 ON (name = s5))

SELECT COALESCE(
  (SELECT AS STRUCT * FROM q1 WHERE s2 = to_page() LIMIT 1),
  (SELECT AS STRUCT * FROM q2 WHERE s3 = to_page() LIMIT 1),
  (SELECT AS STRUCT * FROM q3 WHERE s4 = to_page() LIMIT 1),
  (SELECT AS STRUCT * FROM q4 WHERE s5 = to_page() LIMIT 1),
  (SELECT AS STRUCT * FROM q5 WHERE s6 = to_page() LIMIT 1)
);