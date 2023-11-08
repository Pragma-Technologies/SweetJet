import { Destructor } from '@pragma-web-utils/hooks'
import { Atom, PrimitiveAtom } from 'jotai'
import { Refreshable, StateValue } from './CommonState'
import { BaseStatesStorage } from './CommonStateStorage'

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
