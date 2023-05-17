import { useEffect, useMemo } from 'react'
import { CommonState, StateValue, SwitchStateManager } from '../types'
import { useCommonState } from './useCommonState'

// TODO: write tests if needed refactor without `useCommonState`
export const useSwitchCommonState = <Origin extends CommonState, Value, Error = unknown, Initial = Value>(
  origin: Origin,
  initial: Initial | (() => Initial),
): SwitchStateManager<Origin, Value, Error, Initial> => {
  const { state, setState, setRefresh } = useCommonState<Value, Error, Initial>(initial)

  const stateManager = useMemo<SwitchStateManager<Origin, Value, Error, Initial>>(
    () => ({
      state: {
        ...state,
        isActual: origin.isActual && state.isActual,
        isLoading: origin.isLoading || state.isLoading,
        softRefresh: () => {
          if (!origin.isLoading) {
            return state.softRefresh()
          }
        },
        hardRefresh: () => {
          if (!origin.isLoading) {
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

  useEffect(() => stateManager.state.hardRefresh(), [origin.isLoading])

  return stateManager
}
