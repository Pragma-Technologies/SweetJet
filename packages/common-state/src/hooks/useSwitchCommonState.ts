import { useEffect, useMemo, useRef } from 'react'
import { NOT_PROVIDED_REFRESH_FUNCTION } from '../constants'
import { CommonState, StateValue, SwitchOption, SwitchStateManager, SwitchStateRefreshOption } from '../types'
import { useCommonState } from './useCommonState'

const defaultOptions: SwitchOption<undefined> = {
  initial: undefined,
  withRefreshOnOriginUpdate: true,
}

// @ts-ignore
export function useSwitchCommonState<Origin extends CommonState<unknown, unknown, unknown>, Value, Error = unknown>(
  origin: Origin,
  options?: Partial<SwitchOption<undefined>>,
): SwitchStateManager<Origin, Value, Error>
export function useSwitchCommonState<Origin extends CommonState<unknown, unknown, unknown>, Value, Error = unknown>(
  origin: Origin,
  options: SwitchOption<Value>,
): SwitchStateManager<Origin, Value, Error, Value>
export function useSwitchCommonState<
  Origin extends CommonState<unknown, unknown, unknown>,
  Value,
  Error = unknown,
  Initial = unknown,
>(origin: Origin, options: SwitchOption<Initial>): SwitchStateManager<Origin, Value, Error, Initial>

export function useSwitchCommonState<
  Origin extends CommonState<unknown, unknown, unknown>,
  Value,
  Error = unknown,
  Initial = Value,
>(origin: Origin, options: SwitchOption<Initial>): SwitchStateManager<Origin, Value, Error, Initial> {
  options = { ...defaultOptions, ...options }
  // for cache refresh requests when origin value loading
  const refreshCountRef = useRef({ count: 0, isHardReload: false })
  const optionsRef = useRef<SwitchStateRefreshOption<Origin, Value, Error, Initial>>({
    refreshFn: async () => {
      throw NOT_PROVIDED_REFRESH_FUNCTION
    },
  })
  const { state, setState, setRefresh } = useCommonState<Value, Error, Initial>(options.initial)

  const stateManager = useMemo<SwitchStateManager<Origin, Value, Error, Initial>>(
    () => ({
      state: {
        ...state,
        softRefresh: () => {
          refreshCountRef.current.count++
          if (!origin.isLoading && origin.isActual) {
            refreshCountRef.current.count = 0
            return state.softRefresh()
          }
        },
        hardRefresh: () => {
          refreshCountRef.current.count++
          refreshCountRef.current.isHardReload = true
          if (!origin.isLoading && origin.isActual) {
            refreshCountRef.current.count = 0
            refreshCountRef.current.isHardReload = false
            return state.hardRefresh()
          }
        },
      } as CommonState<Value, Error, Initial>,
      setState,
      setRefresh: (options) => {
        optionsRef.current = options
        setRefresh({
          refreshFn: async () => optionsRef.current.refreshFn(origin.value as StateValue<Origin>),
          requestKey: optionsRef.current.requestKey?.(origin.value as StateValue<Origin>),
          onError: optionsRef.current.onError,
        })
      },
    }),
    [state, origin],
  )

  useEffect(() => {
    setRefresh({
      refreshFn: async () => optionsRef.current.refreshFn(origin.value as StateValue<Origin>),
      requestKey: optionsRef.current.requestKey?.(origin.value as StateValue<Origin>),
      onError: optionsRef.current.onError,
    })
  }, [origin])

  useEffect(() => {
    if (options.withRefreshOnOriginUpdate && !origin.isLoading && origin.isActual) {
      refreshCountRef.current.count = 0
      refreshCountRef.current.isHardReload = false
      return state.hardRefresh()
    }
  }, [origin.value, origin.isActual])

  useEffect(() => {
    if (!origin.isLoading && !!refreshCountRef.current.count) {
      return refreshCountRef.current.isHardReload ? stateManager.state.hardRefresh() : stateManager.state.softRefresh()
    }
  }, [origin.isLoading])

  return stateManager
}
