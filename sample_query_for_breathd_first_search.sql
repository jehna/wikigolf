CREATE OR REPLACE FUNCTION search_path(start integer, destination integer)
RETURNS TABLE(depth integer, path integer[]) AS $$
BEGIN
RETURN QUERY
 WITH RECURSIVE search_paper(id, link, data, depth, route, cycle) AS (
  SELECT r.pid, r.citation, 'data', 1,
    ARRAY[r.pid],
    false
  FROM reference r where r.pid=start

 UNION ALL

 SELECT r.pid, r.citation, 'data',  sp.depth+1,
    route || r.pid,
    r.pid = ANY(route)
 FROM reference r, search_paper sp
 WHERE r.pid = sp.link AND NOT cycle
)
SELECT sp.depth, (sp.route || sp.link) AS route
FROM search_paper AS sp
WHERE link = destination AND NOT cycle ORDER BY depth ASC;

END;
$$ LANGUAGE plpgsql;