interface InitialState {
  type: 'initial'
}

export interface LoadingState {
  type: 'loading'
  from: string
  to: string
}

interface ErrorState {
  type: 'error'
  error: Error
}

interface SuccessState {
  type: 'success'
  results: string[]
}

type AppState = InitialState | LoadingState | ErrorState | SuccessState

export default AppState
