import {
  ActualStateValue,
  BaseStatesStorage,
  NOT_PROVIDED_STATE_STRICT_CONTEXT,
  NOT_REGISTERED_STATE,
  Refreshable,
  StatesStorage,
  StateValue,
  StrictStorageState,
  StrictStorageWrapper,
} from '@pragma-web-utils/common-state'
import { Destructor } from '@pragma-web-utils/hooks'
import { Atom, atom, PrimitiveAtom, useAtom } from 'jotai'
import { Context, FC, PropsWithChildren, useContext, useEffect, useState } from 'react'

export type AtomStatesStorage<T extends BaseStatesStorage> = {
  getCommonStateAtom: <K extends keyof T>(stateKey: K) => Atom<T[K]>
  initState: <K extends keyof T>(
    stateKey: K,
    initial: StateValue<Exclude<T[K], undefined>>,
    onMount: (setState: (refreshState: Refreshable) => void) => void | Destructor,
  ) => {
    stateAtom: PrimitiveAtom<Omit<T[K], keyof Refreshable>>
    refreshAtom: PrimitiveAtom<Refreshable>
  }
}

type AtomStatesMap<T extends BaseStatesStorage, K extends keyof T = keyof T> = Map<
  K,
  PrimitiveAtom<Omit<T[K], keyof Refreshable>>
>
type AtomRefreshMap<T extends BaseStatesStorage, K extends keyof T = keyof T> = Map<K, PrimitiveAtom<Refreshable>>
type AtomRefreshableMap<T extends BaseStatesStorage, K extends keyof T = keyof T> = Map<K, Atom<T[K]>>

export class AtomStatesBaseStorage<T extends BaseStatesStorage> implements AtomStatesStorage<T> {
  private _statesMap: AtomStatesMap<T> = new Map()
  private _refreshMap: AtomRefreshMap<T> = new Map()
  private _refreshableMap: AtomRefreshableMap<T> = new Map()

  getCommonStateAtom<K extends keyof T>(stateKey: K): Atom<T[K]> {
    const refreshableAtom = this._refreshableMap.get(stateKey) as Atom<T[K]> | undefined
    if (refreshableAtom) {
      return refreshableAtom
    }
    const newAtom = atom((get) => {
      const stateAtom = this._statesMap.get(stateKey)
      const refreshAtom = this._refreshMap.get(stateKey)
      if (!stateAtom || !refreshAtom) {
        throw 'not provided state'
      }

      return { ...get(stateAtom), ...get(refreshAtom) } as T[K]
    })
    this._refreshableMap.set(stateKey, newAtom)
    return newAtom
  }

  initState<K extends keyof T>(
    stateKey: K,
    initial: StateValue<Exclude<T[K], undefined>>,
    onMount: (setState: (refreshState: Refreshable) => void) => void | Destructor,
  ): {
    stateAtom: PrimitiveAtom<Omit<T[K], keyof Refreshable>>
    refreshAtom: PrimitiveAtom<Refreshable>
  } {
    let stateAtom = this._statesMap.get(stateKey)
    let refreshAtom = this._refreshMap.get(stateKey)
    if (!stateAtom) {
      stateAtom = atom<Omit<T[keyof T], keyof Refreshable>>({
        value: initial,
        isLoading: false,
        isActual: false,
        error: undefined,
        cached: initial,
        key: '',
      } as Omit<Exclude<T[keyof T], undefined>, keyof Refreshable>)
      this._statesMap.set(stateKey, stateAtom)
    }
    if (!refreshAtom) {
      const defaultRefreshable: Refreshable = {
        softRefresh: () => {
          throw 'no provide refresh'
        },
        hardRefresh: () => {
          throw 'no provide refresh'
        },
      }
      refreshAtom = atom<Refreshable>({ ...defaultRefreshable })
      // add reset refresh function on unmount
      refreshAtom.onMount = (setAtom) => {
        const destructor = onMount(setAtom)
        return () => {
          destructor?.()
          setAtom({ ...defaultRefreshable })
        }
      }
      this._refreshMap.set(stateKey, refreshAtom)
    }

    return {
      stateAtom: stateAtom as unknown as PrimitiveAtom<Omit<T[K], keyof Refreshable>>,
      refreshAtom,
    }
  }
}

export function getStrictWrapper<T extends BaseStatesStorage, K extends keyof T>(
  atomStorage: AtomStatesStorage<T>,
  isValueValid: (stateKey: K, value: StateValue<StrictStorageState<T, K>>) => boolean = (stateKey, value) =>
    value !== undefined && value !== null,
): FC<PropsWithChildren<StrictStorageWrapper<T, K>>> {
  return (props) => {
    const { isActual, value, error } = useStateValue(atomStorage, props.stateKey)

    if (!isActual) {
      return <props.skeleton />
    }

    if (!isValueValid(props.stateKey, value as StateValue<StrictStorageState<T, K>>) || error) {
      return <props.error />
    }

    return <>{props.children} </>
  }
}

export function useStateValue<T extends BaseStatesStorage, K extends keyof T>(
  atomStorage: AtomStatesStorage<T>,
  stateKey: K,
): StrictStorageState<T, K> {
  const [state] = useAtom(atomStorage.getCommonStateAtom(stateKey))

  if (state === undefined || state === null) {
    throw `${stateKey as string}: ${NOT_REGISTERED_STATE}`
  }
  return state as StrictStorageState<T, K>
}

export function useStrictStateValue<T extends BaseStatesStorage, K extends keyof T>(
  atomStorage: AtomStatesStorage<T>,
  stateKey: K,
  isValueValid: (stateKey: K, value: StateValue<StrictStorageState<T, K>>) => boolean = () => true,
): ActualStateValue<StrictStorageState<T, K>> {
  const state = useStateValue(atomStorage, stateKey)

  if (!isValueValid(stateKey, state as StateValue<StrictStorageState<T, K>>)) {
    throw `${stateKey as string}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}`
  }
  return state.value as ActualStateValue<StrictStorageState<T, K>>
}

export function useRegisterStateToStorage<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
  stateKey: K,
  state: StrictStorageState<T, K>,
): void {
  const contextValue = useContext(context)
  useState(() => contextValue.updateState(stateKey, state))

  useEffect(() => {
    const prevState = contextValue.getState(stateKey)
    if (prevState !== state) {
      contextValue.updateState(stateKey, state)
    }
  }, [state])
}
