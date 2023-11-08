// hook types overloading
import { Context, useCallback, useContext, useState } from 'react'
import { useRegisterStateToStorage } from '../context'
import {
  BaseStatesStorage,
  CacheableState,
  StateManager,
  StatesStorage,
  StateStoreFactory,
  StateStoreOptions,
} from '../types'
import { commonStateFactory } from '../utils'

export function useBaseStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown>(stateKey: K, initial?: undefined) => StateManager<Value, Error>
export function useBaseStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown>(stateKey: K, initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function useBaseStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown, Initial = unknown>(
  stateKey: K,
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial>

export function useBaseStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  const stateStore = defaultStateStore(context)
  return <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => {
    const stateManager = commonStateFactory<Value, Error, Initial>((options) => stateStore(stateKey, options))(initial)
    useRegisterStateToStorage(context, stateKey, stateManager.state as Exclude<T[K], undefined>)
    return stateManager
  }
}

const defaultStateStore = <T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): (<Value, Error, Initial>(
  stateKey: K,
  options: StateStoreOptions<Value, Error, Initial>,
) => ReturnType<StateStoreFactory<Value, Error, Initial>>) => {
  return <Value, Error, Initial>(
    stateKey: K,
    { initial, beforeRefresh, refresh }: StateStoreOptions<Value, Error, Initial>,
  ) => {
    // if initial is dispatch function call it ones for get value (imitate useState common logic)
    const [_initial] = useState<Initial>(initial)
    const contextValue = useContext(context)
    const [state, setState] = useState<CacheableState<Value, Error, Initial>>(
      () =>
        (contextValue.getState(stateKey) as CacheableState<Value, Error, Initial>) ?? {
          value: _initial,
          isLoading: false,
          isActual: false,
          error: undefined,
          cached: _initial,
          key: '',
        },
    )

    const softRefresh = useCallback(() => refresh(_initial, setState), [])
    const hardRefresh = useCallback(() => {
      const destructors = [beforeRefresh?.(_initial, setState), refresh(_initial, setState)]
      return () => {
        destructors.forEach((destructor) => destructor?.())
      }
    }, [])

    return { state, setState, refreshable: { softRefresh, hardRefresh } }
  }
}
