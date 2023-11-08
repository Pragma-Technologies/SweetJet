import { Destructor } from '@pragma-web-utils/hooks'
import { atom, Atom, PrimitiveAtom } from 'jotai'
import { NOT_PROVIDED_REFRESH_FUNCTION, NOT_REGISTERED_STATE } from '../constants'
import { AtomStatesStorage, BaseStatesStorage, Refreshable, StateValue } from '../types'

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
        throw NOT_REGISTERED_STATE
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
          throw NOT_PROVIDED_REFRESH_FUNCTION
        },
        hardRefresh: () => {
          throw NOT_PROVIDED_REFRESH_FUNCTION
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
