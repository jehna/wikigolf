import fetch from 'fetch-jsonp'

const wikiSuggestUrl = (lang: string, input: string) =>
  `https://${lang}.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&&namespace=0&limit=10&suggest=false&redirects=resolve&search=` +
  encodeURIComponent(input)

export async function suggestWikiPage(
  input: string,
  language: string
): Promise<string[]> {
  const req = await fetch(wikiSuggestUrl(language, input))
  const [, suggestions] = await req.json()
  return suggestions
}
