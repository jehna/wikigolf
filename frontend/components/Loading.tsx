import React, { useEffect, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const Heading = styled.h3`
  margin: 1em 0 0.3em;
`

export default () => (
  <div>
    <Heading>Crunching data...</Heading>
    <Pacman />
  </div>
)

const WIDTH = 30

const topPart = keyframes`
  0% {
    transform: none;
  }
  50% {
    transform: none;
  }
  100% {
    transform: rotate(-40deg);
  }
`
const bottomPart = keyframes`
  0% {
    transform: rotate(180deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(220deg);
  }
`
const jump = keyframes`
  0% {
    transform: none;
  }
  100% {
    transform: translateY(-10px);
  }
`

const scroll = keyframes`
  0% {
    transform: translateX(51px);
  }
  100% {
    transform: none;
  }
`

const PacPartTop = styled.div`
  width: ${WIDTH}px;
  height: ${WIDTH / 2}px;
  border-radius: ${WIDTH / 2}px ${WIDTH / 2}px 0 0;
  background: #54c2fe;
  margin-bottom: -${WIDTH / 2}px;
  transform-origin: ${WIDTH / 2}px ${WIDTH / 2}px;
  animation: 0.25s ${topPart} alternate ease-out infinite;
`
const PacPartBottom = styled(PacPartTop)`
  animation-name: ${bottomPart};
`

const PacJump = styled.div`
  animation: 0.25s ${jump} alternate ease-out infinite;
`

const Data = styled.div`
  letter-spacing: 2em;
  font-size: 10px;
  animation: 1s ${scroll} linear infinite;
  margin-top: 12px;
  margin-bottom: -16px;
`

const Wrapper = styled.div`
  overflow: hidden;
  height: 50px;
  color: #1452bf;
`

const Progress = styled.progress`
  margin-top: 20px;
`

const Pacman = () => {
  const [p, setP] = useState(0)
  useEffect(() => {
    // Okay, not actually doing anythiung "real", but I know that on average it
    // takes 16 seconds to resolve the query, so we can cheat for something that
    // looks like 16 seconds
    const interval = setInterval(() => setP(p + (1 - p) * 0.01), 100)
    return () => clearInterval(interval)
  })
  return (
    <Wrapper>
      <Data>01010101010101010101010101010101</Data>
      <PacJump>
        <PacPartTop />
        <PacPartBottom />
      </PacJump>
      <Progress value={p} />
    </Wrapper>
  )
}
