import { useMemo } from 'react'
import { HookCommonState } from '../types'

export const useMapCommonState = <T, K, E>(
  state: HookCommonState<T, E>,
  mapper: (value: T) => K,
  additionalDepsKey?: string,
): HookCommonState<K, E> => {
  return useMemo(
    () => ({
      ...state,
      value: mapper(state.value),
      cached: state.cached && mapper(state.cached),
    }),
    [state, additionalDepsKey],
  )
}
