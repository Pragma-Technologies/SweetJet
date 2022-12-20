import { Dispatch, SetStateAction } from 'react'
import { Destructor } from './common'

export interface State<T = unknown, E = unknown> {
  value: T
  error: E | undefined
  isLoading: boolean
  isActual: boolean
}

export interface RefreshableState<T = unknown, E = unknown> extends State<T, E> {
  softRefresh: () => Destructor | void
  hardRefresh: () => Destructor | void
}

export interface HookCommonState<T = unknown, E = unknown> extends RefreshableState<T, E> {
  cached?: T
}

export interface StateRefreshOption<T> {
  refreshFn: () => Promise<T>
  requestKey: string
}

export interface CommonState<T = unknown, E = unknown> {
  state: RefreshableState<T, E>
  setState: Dispatch<SetStateAction<State<T, E>>>
  setRefresh: (params: StateRefreshOption<T>) => void
}
