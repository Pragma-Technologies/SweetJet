import { useMemo } from 'react'
import {
  CombineHookCommonState,
  CombineHookCommonStateStates,
  CombineHookCommonStateTupleErrors,
  HookCommonState,
} from '../types'

export function useCombineCommonStates<T extends HookCommonState[]>(...states: T): CombineHookCommonState<T> {
  return useMemo((): CombineHookCommonState<T> => {
    const errors = states.map(({ error }) => error) as CombineHookCommonStateTupleErrors<T>
    const error = errors.some((error) => !!error) ? { error: errors } : undefined
    const cachedArr = states.map(({ cached }) => cached)
    const cached = cachedArr.some((cached) => !!cached) ? (cachedArr as CombineHookCommonStateStates<T>) : undefined
    return {
      value: states.map(({ value }) => value) as CombineHookCommonStateStates<T>,
      error,
      isLoading: states.some(({ isLoading }) => isLoading),
      isActual: states.every(({ isActual }) => isActual),
      cached,
      softRefresh: () => {
        const cancels = states.map(({ softRefresh }) => softRefresh())
        return () => {
          cancels.forEach((cancel) => cancel?.())
        }
      },
      hardRefresh: () => {
        const cancels = states.map(({ hardRefresh }) => hardRefresh())
        return () => {
          cancels.forEach((cancel) => cancel?.())
        }
      },
    }
  }, [states])
}
