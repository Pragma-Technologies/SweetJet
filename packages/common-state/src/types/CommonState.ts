import { Dispatch, SetStateAction } from 'react'
import { Destructor } from './common'

export interface State<T = unknown, E = unknown> {
  value: T
  error: E | undefined
  isLoading: boolean
  isActual: boolean
}

export interface Cacheable<T = unknown> {
  cached: T
}

export interface Refreshable {
  softRefresh: () => Destructor | void
  hardRefresh: () => Destructor | void
}

export interface CacheableState<T = unknown, E = unknown> extends State<T, E>, Cacheable<T> {}
export interface RefreshableState<T = unknown, E = unknown> extends State<T, E>, Refreshable {}

export interface HookCommonState<T = unknown, E = unknown> extends State<T, E>, Refreshable, Cacheable<T> {}

export interface StateRefreshOption<T, E> {
  refreshFn: () => Promise<T>
  requestKey?: string
  onError?: (error: E, state: CacheableState<T, E>) => void
}

export interface StateManager<T = unknown, E = unknown> {
  state: HookCommonState<T, E>
  setState: Dispatch<SetStateAction<CacheableState<T, E>>>
  setRefresh: (params: StateRefreshOption<T, E>) => void
}

/**
 * @deprecated use StateManager
 */
export type CommonState<T = unknown, E = unknown> = StateManager<T, E>
