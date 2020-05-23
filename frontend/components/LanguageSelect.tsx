import React from 'react'
import styled from 'styled-components'

const Select = styled.select`
  all: unset;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cGF0aCBkPSJNMjI1LjgxMyA0OC45MDdMMTI4IDE0Ni43MiAzMC4xODcgNDguOTA3IDAgNzkuMDkzbDEyOCAxMjggMTI4LTEyOHoiLz48L3N2Zz4=')
    calc(100% - 5px) 50%/10px no-repeat;
  padding: 3px 17px 1px 3px;
  outline: 1px solid #ccc;
  margin: -2px 7px 0 0;
  font-size: 0.8em;
`

interface LanguageSelectProps {
  onChange: (value: string) => void
}

export default ({ onChange }: LanguageSelectProps) => (
  <Select onChange={(e) => onChange(e.target.value)}>
    <option value="en">English</option>
    <option value="fi">Finnish</option>
  </Select>
)
