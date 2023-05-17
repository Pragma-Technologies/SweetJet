import { useEffect, useMemo, useRef } from 'react'
import { CommonState, StateValue, SwitchStateManager } from '../types'
import { useCommonState } from './useCommonState'

export function useSwitchCommonState<Origin extends CommonState<unknown, unknown, unknown>, Value, Error = unknown>(
  origin: Origin,
  initial?: undefined,
): SwitchStateManager<Origin, Value, Error>
export function useSwitchCommonState<Origin extends CommonState<unknown, unknown, unknown>, Value, Error = unknown>(
  origin: Origin,
  initial: Value | (() => Value),
): SwitchStateManager<Origin, Value, Error, Value>
export function useSwitchCommonState<
  Origin extends CommonState<unknown, unknown, unknown>,
  Value,
  Error = unknown,
  Initial = unknown,
>(origin: Origin, initial: Initial | (() => Initial)): SwitchStateManager<Origin, Value, Error, Initial>

export function useSwitchCommonState<
  Origin extends CommonState<unknown, unknown, unknown>,
  Value,
  Error = unknown,
  Initial = Value,
>(origin: Origin, initial: Initial | (() => Initial)): SwitchStateManager<Origin, Value, Error, Initial> {
  // for cache refresh requests when origin value loading
  const refreshCountRef = useRef({ count: 0, isHardReload: false })
  const { state, setState, setRefresh } = useCommonState<Value, Error, Initial>(initial)

  const stateManager = useMemo<SwitchStateManager<Origin, Value, Error, Initial>>(
    () => ({
      state: {
        ...state,
        softRefresh: () => {
          refreshCountRef.current.count++
          if (!origin.isLoading) {
            refreshCountRef.current.count = 0
            return state.softRefresh()
          }
        },
        hardRefresh: () => {
          refreshCountRef.current.count++
          refreshCountRef.current.isHardReload = true
          if (!origin.isLoading) {
            refreshCountRef.current.count = 0
            refreshCountRef.current.isHardReload = false
            return state.hardRefresh()
          }
        },
      } as CommonState<Value, Error, Initial>,
      setState,
      setRefresh: (options) =>
        setRefresh({
          refreshFn: async () => options.refreshFn(origin.value as StateValue<Origin>),
          requestKey: options.requestKey?.(origin.value as StateValue<Origin>),
          onError: options.onError,
        }),
    }),
    [state, origin],
  )

  useEffect(() => {
    if (!origin.isLoading && !!refreshCountRef.current.count) {
      return refreshCountRef.current.isHardReload ? stateManager.state.hardRefresh() : stateManager.state.softRefresh()
    }
  }, [origin.isLoading])

  return stateManager
}
