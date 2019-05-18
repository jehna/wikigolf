import fetch from 'fetch-jsonp'

const BASE_WIKI_SUGGEST_URL =
  'https://fi.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&&namespace=0&limit=10&suggest=false&search='

export async function suggestWikiPage(input: string): Promise<string[]> {
  const req = await fetch(BASE_WIKI_SUGGEST_URL + encodeURIComponent(input))
  const [, suggestions] = await req.json()
  return suggestions
}
