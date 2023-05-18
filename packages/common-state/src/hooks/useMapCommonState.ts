import { Deps } from '@pragma-web-utils/hooks'
import { useMemo } from 'react'
import { CommonState } from '../types'

export const useMapCommonState = <T, K, E, TI, KI>(
  state: CommonState<T, E, TI>,
  mapper: <V extends T | TI>(value: V) => V extends T ? K : KI,
  deps: Deps = [],
): CommonState<K, E, KI> => {
  return useMemo(
    () => ({ ...state, value: mapper(state.value), cached: mapper(state.cached) } as CommonState<K, E, KI>),
    [state, ...deps],
  )
}
