import { Deps } from '@pragma-web-utils/hooks'
import { useMemo } from 'react'
import { HookCommonState } from '../types'

export const useMapCommonState = <T, K, E>(
  state: HookCommonState<T, E>,
  mapper: (value: T) => K,
  deps: Deps = [],
): HookCommonState<K, E> => {
  return useMemo(() => ({ ...state, value: mapper(state.value), cached: mapper(state.cached) }), [state, ...deps])
}
