import React, { useState, useEffect } from 'react'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'
import Results from './Results'
import AppState, { LoadingState } from '../AppState'
import styled from 'styled-components'
import Loading from './Loading'
import LanguageSelect from './LanguageSelect'

const Main = styled.div`
  border-radius: 0.2em;
  background: #fff;
  padding: 1.5em 1em;
  font-family: 'Nunito Sans', sans-serif;
  max-width: 600px;
  margin: auto;
`

const Heading = styled.h1`
  background: linear-gradient(135deg, #54c2fe, #1452bf);
  color: #fff;
  font-family: 'Nunito Sans', sans-serif;
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

const Form = styled.form`
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

  &[disabled] {
    background: #ddd;
  }
`

export default ({}) => {
  const [appState, setAppState] = useState<AppState>({ type: 'initial' })
  useEffect(() => {
    if (!isLoading(appState)) return
    getShortestRoute(appState.from, appState.to, appState.lang)
      .then((results) => setAppState({ type: 'success', results }))
      .catch((error) => setAppState({ type: 'error', error }))
  }, [appState])

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [lang, setLang] = useState('en')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAppState({
      type: 'loading',
      from,
      to,
      lang,
    })
  }

  const restart = () => setAppState({ type: 'initial' })

  return (
    <>
      <Heading>Wikigolf</Heading>
      <Main>
        <div>
          Find least amount of clicks in{' '}
          <LanguageSelect onChange={(value) => setLang(value)} /> wikipedia
          between:
        </div>
        <Form onSubmit={onSubmit}>
          <PageSelector
            lang={lang}
            disabled={appState.type !== 'initial'}
            onChange={(value) => setFrom(value)}
            placeholder="E.g. Helsinki"
          />
          <div>and</div>
          <PageSelector
            lang={lang}
            disabled={appState.type !== 'initial'}
            onChange={(value) => setTo(value)}
            placeholder="E.g. COVID-19"
          />
          {getResults(appState, from, to, lang)}
        </Form>
        {(appState.type === 'error' || appState.type === 'success') && (
          <Submit type="button" onClick={restart}>
            Restart
          </Submit>
        )}
      </Main>
    </>
  )
}

function isLoading(state: AppState): state is LoadingState {
  return state.type === 'loading'
}

function getResults(
  appState: AppState,
  from: string,
  to: string,
  lang: string
) {
  switch (appState.type) {
    case 'success':
      return <Results results={appState.results} lang={lang} />
    case 'loading':
      return <Loading />
    case 'initial':
      return (
        <Submit type="submit" disabled={!from || !to}>
          Search!
        </Submit>
      )
    case 'error':
      return <div>{appState.error.message}</div>
  }
}
