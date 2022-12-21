import { Dispatch, SetStateAction } from 'react'
import { Destructor } from './common'

export interface State<T = unknown, E = unknown> {
  value: T
  error: E | undefined
  isLoading: boolean
  isActual: boolean
}

export interface Refreshable {
  softRefresh: () => Destructor | void
  hardRefresh: () => Destructor | void
}

export interface Cacheable<T = unknown> {
  cached?: T
}

export interface CacheableState<T = unknown, E = unknown> extends State<T, E>, Cacheable<T> {}

export interface HookCommonState<T = unknown, E = unknown> extends State<T, E>, Refreshable, Cacheable<T> {}

export interface StateRefreshOption<T> {
  refreshFn: () => Promise<T>
  requestKey?: string
}

export interface CommonState<T = unknown, E = unknown> {
  state: HookCommonState<T, E>
  setState: Dispatch<SetStateAction<State<T, E>>>
  setRefresh: (params: StateRefreshOption<T>) => void
}
