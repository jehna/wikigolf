import React from 'react'
import { F, Atom } from '@grammarly/focal'
import { flatMap, filter, debounceTime, zip } from 'rxjs/operators'
import { suggestWikiPage } from '../model/wikipedia'
import Suggestions from './Suggestions'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: block;
  margin: 0 1em;
  text-align: left;
`

const Input = styled(F.input)`
  width: 100%;
  font-size: 28px;
  padding: 0.3em 0.4em;
  outline: none;
  font-family: inherit;
  border: 0;
  border: 2px solid #e0e0e0;

  :focus {
    box-shadow: 0 0px 4px 1px #a7d7f9;
  }

  ::placeholder {
    color: #aaa;
  }
`

interface PageSelectorProps {
  onChange: (value: string) => void
  lang: Atom<string>
  placeholder?: string
}

export default ({ onChange, placeholder, lang }: PageSelectorProps) => {
  const localValue = Atom.create('')
  const suggestions = Atom.create<string[]>([])
  const selectedValue = Atom.create('')

  localValue
    .pipe(
      filter(Boolean),
      filter((value) => selectedValue.get() !== value),
      debounceTime(200),
      flatMap((value: string) => suggestWikiPage(value, lang.get()))
    )
    .subscribe((newSuggestions) => suggestions.set(newSuggestions as any)) // TODO: Fix types, broken from ts update

  selectedValue.subscribe((value) => {
    localValue.set(value)
    suggestions.set([])
    onChange(value)
  })

  return (
    <Wrapper>
      <Input
        onChange={(e) => localValue.set(e.currentTarget.value)}
        value={localValue}
        placeholder={placeholder}
      />
      <Suggestions
        onSelect={(suggestion) => selectedValue.set(suggestion)}
        suggestions={suggestions}
      />
    </Wrapper>
  )
}
