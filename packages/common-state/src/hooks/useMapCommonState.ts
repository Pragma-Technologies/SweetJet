import { Deps } from '@pragma-web-utils/hooks'
import { useMemo } from 'react'
import { CommonState } from '../types'

export function useMapCommonState<T1, T2, E = unknown, I extends unknown = undefined>(
  state: CommonState<T1, E, I>,
  mapper: (value: T1 | I) => T2 | I,
  deps?: Deps,
): CommonState<T2, E, I>

export function useMapCommonState<T1, T2, E = unknown, I1 extends unknown = undefined, I2 extends unknown = undefined>(
  state: CommonState<T1, E, I1>,
  mapper: (value: T1 | I1) => T2 | I2,
  deps?: Deps,
): CommonState<T2, E, I2>

export function useMapCommonState<T1, T2, E, I1, I2>(
  state: CommonState<T1, E, I1>,
  mapper: (value: T1 | I1) => T2 | I2,
  deps: Deps = [],
): CommonState<T2, E, I2> {
  return useMemo(
    () =>
      ({
        ...state,
        value: mapper(state.value as T1 | I1),
        cached: mapper(state.cached as T1 | I1),
      } as CommonState<T2, E, I2>),
    [state, ...deps],
  )
}
