import { useMemo } from 'react'
import {
  CombineHookCommonState,
  CombineHookCommonStateStates,
  CombineHookCommonStateTupleErrors,
  CommonState,
} from '../types'

export function useCombineCommonStates<T extends CommonState[]>(...states: T): CombineHookCommonState<T> {
  return useMemo((): CombineHookCommonState<T> => {
    const errors = states.map(({ error }) => error) as CombineHookCommonStateTupleErrors<T>
    const error = errors.some((error) => !!error) ? { error: errors } : undefined
    return {
      value: states.map(({ value }) => value) as CombineHookCommonStateStates<T>,
      error,
      isLoading: states.some(({ isLoading }) => isLoading),
      isActual: states.every(({ isActual }) => isActual),
      cached: states.map(({ cached }) => cached) as CombineHookCommonStateStates<T>,
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
    } as CombineHookCommonState<T>
  }, [states])
}
