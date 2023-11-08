// hook types overloading
import { useCallback, useState } from 'react'
import { CacheableState, StateManager, StateStoreFactory, StateStoreOptions } from '../types'
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

const defaultStateStore = <Value, Error, Initial>({
  initial,
  beforeRefresh,
  refresh,
}: StateStoreOptions<Value, Error, Initial>): ReturnType<StateStoreFactory<Value, Error, Initial>> => {
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

  const softRefresh = useCallback(() => refresh(_initial, setState), [])
  const hardRefresh = useCallback(() => {
    const destructors = [beforeRefresh?.(_initial, setState), refresh(_initial, setState)]
    return () => {
      destructors.forEach((destructor) => destructor?.())
    }
  }, [])

  return { state, setState, refreshable: { softRefresh, hardRefresh } }
}
