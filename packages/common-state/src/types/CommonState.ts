import { Dispatch, SetStateAction } from 'react'
import { Destructor } from './common'

export type ActualState<T = unknown> = {
  value: T
  error: undefined
  isLoading: boolean
  isActual: true
  key: string
}

export type NotActualState<T = unknown, I extends unknown = T> = {
  value: T | I
  error: undefined
  isLoading: boolean
  isActual: false
  key: string
}

export type ErrorState<I = unknown, E = unknown> = {
  value: I
  error: E
  isLoading: boolean
  isActual: boolean
  key: string
}

export type State<T = unknown, E = unknown, I = undefined> = ActualState<T> | NotActualState<T, I> | ErrorState<I, E>

export interface Cacheable<T = unknown> {
  cached: T
}

export type RefreshCallback = () => Destructor | void

export interface Refreshable {
  softRefresh: RefreshCallback
  hardRefresh: RefreshCallback
}

export type CacheableState<T = unknown, E = unknown, I = undefined> = State<T, E, I> & Cacheable<T | I>
export type RefreshableState<T = unknown, E = unknown, I = undefined> = State<T, E, I> & Refreshable

/**
 * @deprecated use CommonState
 */
export type HookCommonState<T = unknown, E = unknown> = State<T, E, T> & Refreshable & Cacheable<T>
export type CommonState<T = unknown, E = unknown, I = undefined> = State<T, E, I> & Refreshable & Cacheable<T | I>

export type StateValue<S extends State<unknown, unknown, unknown>> = ActualStateValue<S> | ErrorStateValue<S>

export type ActualStateValue<S extends State<unknown, unknown, unknown>> = S extends ActualState
  ? S extends ActualState<infer T>
    ? T
    : never
  : never

export type ErrorStateValue<S extends State<unknown, unknown, unknown>> = S extends ErrorState
  ? S extends ErrorState<infer T>
    ? T
    : never
  : never

export interface StateRefreshOption<T, E, I> {
  refreshFn: () => Promise<T>
  requestKey?: string
  onError?: (error: E, state: CacheableState<T, E, I>) => void
}

/*
 TODO:
  change `(origin: StateValue<O>) => ...`
  to `{ next: (origin: ActualStateValue<O>) => ..., error: (origin: ErrorStateValue<O>) => ... }`
 */
export interface SwitchStateRefreshOption<O extends CommonState<unknown, unknown, unknown>, T, E, I> {
  refreshFn: (origin: StateValue<O>) => Promise<T>
  requestKey?: (origin: StateValue<O>) => string
  onError?: (error: E, state: CacheableState<T, E, I>) => void
}

export interface StateManager<T = unknown, E = unknown, I = undefined> {
  state: CommonState<T, E, I>
  setState: Dispatch<SetStateAction<CacheableState<T, E, I>>>
  setRefresh: (params: StateRefreshOption<T, E, I>) => void
  resetStateActuality: () => void
}

export interface SwitchStateManager<
  O extends CommonState<unknown, unknown, unknown>,
  T = unknown,
  E = unknown,
  I = undefined,
> {
  state: CommonState<T, E, I>
  setState: Dispatch<SetStateAction<CacheableState<T, E, I>>>
  setRefresh: (params: SwitchStateRefreshOption<O, T, E, I>) => void
}

export type SwitchOption<Initial> = {
  initial: Initial | (() => Initial)
  withRefreshOnOriginUpdate?: boolean
}
