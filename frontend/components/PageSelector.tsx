import React from 'react'
import { F, Atom } from '@grammarly/focal'
import { flatMap, filter, debounceTime } from 'rxjs/operators'
import { suggestWikiPage } from '../model/wikipedia'
import Suggestions from './Suggestions'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: inline-block;
`

interface PageSelectorProps {
  onChange: (value: string) => void
}

export default ({ onChange }: PageSelectorProps) => {
  const localValue = Atom.create('')
  const suggestions = Atom.create<string[]>([])
  const selectedValue = Atom.create('')

  localValue
    .pipe(
      filter(Boolean),
      filter(value => selectedValue.get() !== value),
      debounceTime(200),
      flatMap(suggestWikiPage)
    )
    .subscribe(newSuggestions => suggestions.set(newSuggestions))

  selectedValue.subscribe(value => {
    localValue.set(value)
    suggestions.set([])
    onChange(value)
  })

  return (
    <Wrapper>
      <F.input
        onChange={e => localValue.set(e.currentTarget.value)}
        value={localValue}
      />
      <Suggestions
        onSelect={suggestion => selectedValue.set(suggestion)}
        suggestions={suggestions}
      />
    </Wrapper>
  )
}
