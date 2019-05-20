import React from 'react'

interface ResultsProps {
  results: string[]
}

export default ({ results }: ResultsProps) => {
  if (!results.length) return null

  return (
    <>
      <h2>Results:</h2>
      <ol>
        {results.map(result => (
          <li key={result}>
            <a href={`https://fi.wikipedia.org/wiki/${result}`} target="_blank">
              {fromWikiUrl(result)}
            </a>
          </li>
        ))}
      </ol>
    </>
  )
}

function fromWikiUrl(path: string) {
  return path.replace('_', ' ')
}
