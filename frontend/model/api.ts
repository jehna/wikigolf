export async function getShortestRoute(from: string, to: string) {
  const req = await fetch(
    `/api/shortest-route?from=${toWikiUrl(from)}&to=${toWikiUrl(to)}`
  )
  if (!req.ok) {
    throw new Error('No path found 😩')
  }

  const response = (await req.json()) as string[]
  return response
}

function toWikiUrl(url: string) {
  return encodeURIComponent(url.replace(' ', '_'))
}
