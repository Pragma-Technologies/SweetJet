import { FC } from 'react'
import { CommonState, Destructor } from '../types'

export type BaseStatesStorage = Partial<Record<string, CommonState<unknown, unknown, unknown>>>
export type StateListener<T extends BaseStatesStorage, K extends keyof T> = {
  stateKey: K
  callback: (value: T[K]) => void
  destructor: Destructor
}
export type StrictStorageState<T extends BaseStatesStorage, K extends keyof T> = Exclude<T[K], undefined>

export type StatesStorage<T extends BaseStatesStorage> = {
  getState<K extends keyof T>(stateKey: K): T[K] | undefined
  updateState<K extends keyof T>(stateKey: K, state: T[K]): void
  listenState<K extends keyof T>(stateKey: K, callback: (value: T[K]) => void): Destructor
}

export type StrictStorageWrapper<T extends BaseStatesStorage, K extends keyof T = keyof T> = {
  stateKey: K
  stateValue?: StrictStorageState<T, K>
  skeleton: FC
  error: FC
}
