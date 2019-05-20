import React from 'react'
import { Atom, F } from '@grammarly/focal'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'
import Results from './Results'
import { filter, flatMap } from 'rxjs/operators'
import AppState, { LoadingState } from '../AppState'

export default ({
  from = Atom.create(''),
  to = Atom.create(''),
  appState = Atom.create<AppState>({ type: 'initial' })
}) => {
  appState
    .pipe(
      filter(isLoading),
      flatMap(s => getShortestRoute(s.from, s.to))
    )
    .subscribe(
      results => appState.set({ type: 'success', results }),
      error => appState.set({ type: 'error', error })
    )

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    appState.set({ type: 'loading', from: from.get(), to: to.get() })
  }

  return (
    <F.div>
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
      {appState.view(getResults)}
    </F.div>
  )
}

function isLoading(state: AppState): state is LoadingState {
  return state.type === 'loading'
}

function getResults(appState: AppState) {
  switch (appState.type) {
    case 'success':
      return <Results results={appState.results} />
    case 'loading':
      return <progress />
    case 'error':
      return <div>{appState.error.message}</div>
  }
}
