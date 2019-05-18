import React from 'react'
import { Atom, F } from '@grammarly/focal'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'

const onSubmit = async (from: string, to: string) => {
  const result = getShortestRoute(from, to)
  console.log(result)
}

export default ({ from = Atom.create(''), to = Atom.create('') }) => {
  return (
    <div>
      <h1>Wikigolf</h1>
      <p>Find out the shortest path between two Wikipedia articles — easily!</p>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(from.get(), to.get())
        }}
      >
        <label>
          From:
          <PageSelector onChange={value => from.set(value)} />
        </label>
        <label>
          To:
          <PageSelector onChange={value => to.set(value)} />
        </label>
        <button type="submit">Search!</button>
      </form>
    </div>
  )
}
