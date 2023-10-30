// hook types overloading
import { Dispatch, SetStateAction, useState } from 'react'
import { CacheableState, StateManager } from '../types'
import { commonStateFactory } from '../utils'

export function useCommonState<Value, Error = unknown>(initial?: undefined): StateManager<Value, Error>
export function useCommonState<Value, Error = unknown>(
  initial: Value | (() => Value),
): StateManager<Value, Error, Value>
export function useCommonState<Value, Error = unknown, Initial = unknown>(
  initial: Initial | (() => Initial),
): StateManager<Value, Error, Initial>

export function useCommonState<Value, Error, Initial>(
  initial: Initial | (() => Initial),
): StateManager<Value, Error, Initial> {
  return commonStateFactory<Value, Error, Initial>(defaultStateStore)(initial)
}

const defaultStateStore = <Value, Error = unknown, Initial = unknown>(
  initial: Initial | (() => Initial),
): [
  CacheableState<Value, Error, Initial>,
  Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
  Initial,
] => {
  // if initial is dispatch function call it ones for get value (imitate useState common logic)
  const [_initial] = useState<Initial>(initial)
  const [state, setState] = useState<CacheableState<Value, Error, Initial>>({
    value: _initial,
    isLoading: false,
    isActual: false,
    error: undefined,
    cached: _initial,
    key: '',
  })
  return [state, setState, _initial]
}
