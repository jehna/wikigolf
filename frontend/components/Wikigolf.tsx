import React from 'react'
import { Atom, F, reactiveList } from '@grammarly/focal'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'

export default ({
  from = Atom.create(''),
  to = Atom.create(''),
  results = Atom.create<string[]>([])
}) => {
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    results.set(await getShortestRoute(from.get(), to.get()))
  }

  return (
    <div>
      <h1>Wikigolf</h1>
      <p>Find out the shortest path between two Wikipedia articles — easily!</p>
      <form onSubmit={onSubmit}>
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
      <h2>Results:</h2>
      <F.ol>
        {reactiveList(results, result => (
          <li key={result}>
            <a href={`https://fi.wikipedia.org/wiki/${result}`} target="_blank">
              {result}
            </a>
          </li>
        ))}
      </F.ol>
    </div>
  )
}
