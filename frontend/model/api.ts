export async function getShortestRoute(from: string, to: string) {
  const req = await fetch(
    `/api/shortest-route?from=${encodeURIComponent(
      from
    )}&to=${encodeURIComponent(to)}`
  )
  return req.json()
}
