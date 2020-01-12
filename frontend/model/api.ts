export async function getShortestRoute(from: string, to: string, locale: string) {
  const req = await fetch(
    `/api/shortest-route?from=${toWikiUrl(from)}&to=${toWikiUrl(to)}&locale=${encodeURIComponent(locale)}`
  )
  if (!req.ok) {
    throw new Error('No path found 😩')
  }

  const response = (await req.json()) as string[]
  return response
}

function toWikiUrl(url: string) {
  return encodeURIComponent(url.replace(/ /g, '_'))
}
