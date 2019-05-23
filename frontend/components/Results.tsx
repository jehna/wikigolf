import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  text-align: left;
`

interface ResultsProps {
  results: string[]
}

export default ({ results }: ResultsProps) => {
  if (!results.length) return null

  return (
    <Wrapper>
      <h2>Results:</h2>
      <p>
        You can get from {fromWikiUrl(results[0])} to{' '}
        {fromWikiUrl(results[results.length - 1])} in just {results.length - 1}{' '}
        clicks:
      </p>
      <ol>
        {results.map(result => (
          <li key={result}>
            <a href={`https://fi.wikipedia.org/wiki/${result}`} target="_blank">
              {fromWikiUrl(result)}
            </a>
          </li>
        ))}
      </ol>
    </Wrapper>
  )
}

function fromWikiUrl(path: string) {
  return path.replace(/_/g, ' ')
}
