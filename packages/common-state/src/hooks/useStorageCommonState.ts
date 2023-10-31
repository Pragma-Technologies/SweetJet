// hook types overloading
import { Context, Dispatch, SetStateAction, useCallback, useContext, useState } from 'react'
import { useRegisterStateToStorage } from '../context'
import { BaseStatesStorage, CacheableState, Refreshable, RefreshCallback, StateManager, StatesStorage } from '../types'
import { commonStateFactory } from '../utils'

export function useStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown>(stateKey: K, initial?: undefined) => StateManager<Value, Error>
export function useStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown>(stateKey: K, initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function useStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error = unknown, Initial = unknown>(
  stateKey: K,
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial>

export function useStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  const stateStore = defaultStateStore(context)
  return <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => {
    const stateManager = commonStateFactory<Value, Error, Initial>(
      (initial) => stateStore(stateKey, initial),
      defaultRefreshStore,
    )(initial)
    useRegisterStateToStorage(context, stateKey, stateManager.state as Exclude<T[K], undefined>)
    return stateManager
  }
}

const defaultStateStore = <T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
): (<Value, Error, Initial>(
  stateKey: K,
  initial: Initial | (() => Initial),
) => [
  CacheableState<Value, Error, Initial>,
  Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
  Initial,
]) => {
  return <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => {
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
    return [state, setState, _initial]
  }
}

const defaultRefreshStore: (refresh: RefreshCallback, beforeHardRefresh: RefreshCallback) => Refreshable = (
  refresh,
  beforeHardRefresh,
) => {
  const softRefresh = useCallback(refresh, [])
  const hardRefresh = useCallback(() => {
    const destructors = [beforeHardRefresh(), refresh()]
    return () => {
      destructors.forEach((destructor) => destructor?.())
    }
  }, [])

  return { softRefresh, hardRefresh }
}
