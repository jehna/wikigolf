import React from 'react'
import styled from 'styled-components'

const Positioner = styled.div`
  position: relative;
`

const SuggestionBox = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1), 0px 0px 1px rgba(0, 0, 0, 0.2);
  font-size: 0.8em;

  :empty {
    display: none;
  }
`

const Suggestion = styled.div`
  padding: 0.2em 0.6em;

  &:hover {
    background: #c4ddec;
  }
`

interface SuggestionsProps {
  suggestions: string[]
  onSelect: (value: string) => void
}

export default ({ suggestions, onSelect }: SuggestionsProps) => (
  <Positioner>
    <SuggestionBox>
      {suggestions.map((suggestion) => (
        <Suggestion key={suggestion} onClick={() => onSelect(suggestion)}>
          {suggestion}
        </Suggestion>
      ))}
    </SuggestionBox>
  </Positioner>
)
