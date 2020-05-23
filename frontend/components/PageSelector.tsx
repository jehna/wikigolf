import React, { useState, useEffect, useCallback } from 'react'
import { suggestWikiPage } from '../model/wikipedia'
import Suggestions from './Suggestions'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: block;
  margin: 0 1em;
  text-align: left;
`

const Input = styled.input`
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

  &[disabled] {
    background: white;
    color: #000;
  }
`

interface PageSelectorProps {
  onChange: (value: string) => void
  lang: string
  disabled?: boolean
  placeholder?: string
}

const debounce = (ms: number) => {
  let timeout: number
  return <T extends any[]>(cb: (...args: T) => void) => (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => cb(...args), ms)
  }
}

const onValueChange = debounce(200)(
  async (
    localValue: string,
    selectedValue: string,
    lang: string,
    setSuggestions: (value: string[]) => void
  ) => {
    if (!localValue || selectedValue === localValue) return
    const result = await suggestWikiPage(localValue, lang)
    setSuggestions(result)
  }
)

export default ({
  onChange,
  placeholder,
  lang,
  disabled,
}: PageSelectorProps) => {
  const [localValue, setLocalValue] = useState('')
  const [selectedvalue, setSelectedValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(
    () => onValueChange(localValue, selectedvalue, lang, setSuggestions),
    [localValue, lang]
  )

  useEffect(() => {
    onChange(selectedvalue)
    setLocalValue(selectedvalue)
    setSuggestions([])
  }, [selectedvalue])

  return (
    <Wrapper>
      <Input
        onChange={(e) => setLocalValue(e.currentTarget.value)}
        onBlur={() => setLocalValue(selectedvalue)}
        value={localValue}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Suggestions onSelect={setSelectedValue} suggestions={suggestions} />
    </Wrapper>
  )
}
