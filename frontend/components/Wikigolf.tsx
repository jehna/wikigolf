import React, { useState, useEffect } from 'react'
import PageSelector from './PageSelector'
import { getShortestRoute } from '../model/api'
import Results from './Results'
import AppState, { LoadingState } from '../AppState'
import styled from 'styled-components'
import Loading from './Loading'
import LanguageSelect from './LanguageSelect'

const Main = styled.main`
  border-radius: 0.2em;
  background: #fff;
  padding: 1.5em 1em;
  font-family: 'Nunito Sans', sans-serif;
  max-width: 600px;
  margin: auto;
  min-height: calc(100vh - 85px);
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

const Footer = styled.footer`
  font-size: 0.7em;
  opacity: 0.8;
  font-family: 'Nunito Sans', sans-serif;
  text-align: center;
  padding-bottom: 15px;
`

const Form = styled.form`
  margin: 1em 0;
  text-align: center;
`

const Note = styled.aside`
  padding: 20px 30px;
  margin-top: 30px;
  font-size: 0.7em;
  border: 2px solid #fff5a0;
  color: #333;
  opacity: 0.8;

  form {
    text-align: center;
  }

  input,
  image {
    border: 0;
  }

  sup,
  sub {
    font-size: 0.5em;
  }
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
        {appState.type === 'success' ? (
          <Results results={appState.results} lang={lang} />
        ) : (
          <>
            <div>
              Find least amount of clicks in{' '}
              <LanguageSelect
                value={lang}
                onChange={(value) => setLang(value)}
              />{' '}
              wikipedia between:
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
              {appState.type === 'initial' && (
                <Submit type="submit" disabled={!from || !to}>
                  Search!
                </Submit>
              )}
              {appState.type === 'loading' && <Loading />}
            </Form>
            {appState.type === 'error' && <div>{appState.error.message}</div>}
          </>
        )}
        {(appState.type === 'error' || appState.type === 'success') && (
          <>
            <Submit type="button" onClick={restart}>
              Try again
            </Submit>
            <Note>
              <p>Howdy there!</p>
              <p>
                Sorry to bother you, but I just realised I've gone over my free
                quota for this site (1TB of data) and now keeping this site up
                costs me $5 per ~100&nbsp;queries.
              </p>
              <p>
                If you enjoy the site and want to keep it running, please
                consider <del>donating</del> buing a place at this website's
                credit section
                <sup>[1]</sup>. I'll promise to use all dimes you throw at me to
                keep this site running.
              </p>
              <p>
                Best regards
                <br />- Jesse
              </p>
              <form
                action="https://www.paypal.com/cgi-bin/webscr"
                method="post"
                target="_top"
              >
                <input type="hidden" name="cmd" value="_s-xclick" />
                <input
                  type="hidden"
                  name="hosted_button_id"
                  value="LQKNZQS33JX8Q"
                />
                <input
                  type="image"
                  src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"
                  name="submit"
                  title="PayPal - The safer, easier way to pay online!"
                  alt="Donate with PayPal button"
                />
                <img
                  alt=""
                  src="https://www.paypal.com/en_FI/i/scr/pixel.gif"
                  width="1"
                  height="1"
                />
              </form>

              <p>
                <sub>
                  1. My country's local legisation doesn't allow donations
                </sub>
              </p>
            </Note>
          </>
        )}
      </Main>
      <Footer>
        Done by <a href="https://twitter.com/luotojesse">Jesse Luoto</a> •{' '}
        <a href="https://github.com/jehna/wikigolf">Fork in Github</a>
      </Footer>
    </>
  )
}

function isLoading(state: AppState): state is LoadingState {
  return state.type === 'loading'
}
