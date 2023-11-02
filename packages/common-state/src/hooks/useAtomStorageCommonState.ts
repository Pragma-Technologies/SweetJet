// hook types overloading
import { useAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import {
  AtomStatesStorage,
  BaseStatesStorage,
  CacheableState,
  StateManager,
  StateStoreFactory,
  StateStoreOptions,
  StateValue,
} from '../types'
import { commonStateFactory } from '../utils'

export function useAtomStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error = unknown>(stateKey: K, initial?: undefined) => StateManager<Value, Error>
export function useAtomStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error = unknown>(stateKey: K, initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function useAtomStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
  stateKey: K,
): <Value, Error = unknown, Initial = unknown>(
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial>

export function useAtomStorageCommonState<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  const atomStateStorage = defaultStateStore(storage)
  return <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => {
    return commonStateFactory<Value, Error, Initial>((options) => atomStateStorage(stateKey, options))(initial)
  }
}

const defaultStateStore = <T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): (<Value, Error, Initial>(
  stateKey: K,
  options: StateStoreOptions<Value, Error, Initial>,
) => ReturnType<StateStoreFactory<Value, Error, Initial>>) => {
  return <Value, Error, Initial>(
    stateKey: K,
    { initial, beforeRefresh, refresh }: StateStoreOptions<Value, Error, Initial>,
  ) => {
    // if initial is dispatch function call it ones for get value (imitate useState common logic)
    const [_initial] = useState(initial)
    const [{ stateAtom, refreshAtom }] = useState(() => {
      return storage.initState(stateKey, initial as StateValue<Exclude<T[K], undefined>>, (setState) => {
        setState({ softRefresh, hardRefresh })
      })
    })
    useAtom(refreshAtom)
    // TODO: finish types conflict resolving
    const [state, setState] = useAtom(stateAtom) as unknown as [
      CacheableState<Value, Error, Initial>,
      Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
    ]

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
