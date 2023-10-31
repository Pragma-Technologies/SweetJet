// hook types overloading
import {
  BaseStatesStorage,
  CacheableState,
  commonStateFactory,
  Refreshable,
  RefreshCallback,
  StateManager,
  StateValue,
} from '@pragma-web-utils/common-state'
import { Destructor } from '@pragma-web-utils/hooks'
import { useAtom } from 'jotai'
import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { AtomStatesStorage } from './utils'

export function useCommonStateFactory<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error = unknown>(stateKey: K, initial?: undefined) => StateManager<Value, Error>
export function useCommonStateFactory<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error = unknown>(stateKey: K, initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function useCommonStateFactory<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
  stateKey: K,
): <Value, Error = unknown, Initial = unknown>(
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial>

export function useCommonStateFactory<T extends BaseStatesStorage, K extends keyof T>(
  storage: AtomStatesStorage<T>,
): <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  return <Value, Error, Initial>(stateKey: K, initial: Initial | (() => Initial)) => {
    let onMount: (setState: (refreshState: Refreshable) => void) => Destructor | void = () => {
      return undefined
    }

    const defaultStateStore = (
      initial: Initial | (() => Initial),
    ): [
      CacheableState<Value, Error, Initial>,
      Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
      Initial,
    ] => {
      const [_initial] = useState(initial)
      const [{ stateAtom }] = useState(() => {
        return storage.initState(stateKey, initial as StateValue<Exclude<T[K], undefined>>, onMount)
      })
      const [state, setState] = useAtom(stateAtom)
      return [
        state as unknown as CacheableState<Value, Error, Initial>,
        setState as unknown as Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
        _initial,
      ]
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

      onMount = (setState) => {
        setState({ softRefresh, hardRefresh })
      }
      return { softRefresh, hardRefresh }
    }
    return commonStateFactory<Value, Error, Initial>(defaultStateStore, defaultRefreshStore)(initial)
  }
}
