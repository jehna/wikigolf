import React from 'react'
import { Atom, F } from '@grammarly/focal'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'
import Results from './Results'
import { filter, flatMap } from 'rxjs/operators'
import AppState, { LoadingState } from '../AppState'
import styled from 'styled-components'
import Loading from './Loading'

const Main = styled(F.div)`
  border-radius: 0.2em;
  background: #fff;
  padding: 1.5em 1em;
  font-family: Calibri Bold, AvenirNext, Avenir, -apple-system,
    BlinkMacSystemFont, Roboto Slab, Droid Serif, Segoe UI, Oxygen-Sans, Ubuntu,
    Cantarell, Georgia, serif;
  max-width: 600px;
  margin: auto;
`

const Heading = styled.h1`
  background: linear-gradient(135deg, #54c2fe, #1452bf);
  color: #fff;
  font-family: Calibri Bold, AvenirNext, Avenir, -apple-system,
    BlinkMacSystemFont, Roboto Slab, Droid Serif, Segoe UI, Oxygen-Sans, Ubuntu,
    Cantarell, Georgia, serif;
  font-weight: 600;
  margin: 0.3em 0;
  text-align: center;
  font-size: 34px;
  text-transform: uppercase;
  letter-spacing: 0.23em;
  box-shadow: inset 0 -8px 0 -3px rgba(255, 255, 255, 0.2);
  margin: 0;
  padding: 0.32em 0 0.3em;
`

const Form = styled(F.form)`
  margin: 1em 0;
  text-align: center;
`

const Submit = styled.button`
  appearance: none;
  border: 0;
  border-radius: 0.3em;
  font-size: inherit;
  font-family: inherit;
  background: linear-gradient(135deg, #54c2fe, #1452bf);
  color: #fff;
  padding: 0.5em 0.8em;
  margin-top: 1.5em;
  width: 100%;
  display: block;
`

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
    <>
      <Heading>Wikigolf</Heading>
      <Main>
        <div>Find out the shortest path in Finnish wikipedia between:</div>
        <Form onSubmit={onSubmit}>
          <PageSelector
            onChange={value => from.set(value)}
            placeholder="E.g. Helsinki"
          />
          <div>and</div>
          <PageSelector
            onChange={value => to.set(value)}
            placeholder="E.g. Ranskan kansalliskirjasto"
          />
          {appState.view(getResults)}
        </Form>
      </Main>
    </>
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
      return <Loading />
    case 'initial':
      return <Submit type="submit">Search!</Submit>
    case 'error':
      return <div>{appState.error.message}</div>
  }
}
