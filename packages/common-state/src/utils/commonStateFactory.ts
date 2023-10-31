// hook types overloading
import { useCancelableFactory, useCancelablePool, useIsMounted, useRequestMemo } from '@pragma-web-utils/hooks'
import { Dispatch, SetStateAction, useMemo, useRef } from 'react'
import { CANCEL_PROMISE, NOT_PROVIDED_REFRESH_FUNCTION } from '../constants'
import { CacheableState, ErrorState, Refreshable, RefreshCallback, StateManager, StateRefreshOption } from '../types'

type NotErrorCacheable<T, E, I> = Exclude<CacheableState<T, E, I>, ErrorState<I, E>>

export function commonStateFactory<Value, Error = unknown>(
  stateStorage: (
    initial?: undefined | (() => void),
  ) => [CacheableState<Value, Error>, Dispatch<SetStateAction<CacheableState<Value, Error>>>, undefined],
  refreshStore: (refresh: RefreshCallback, beforeHardRefresh: RefreshCallback) => Refreshable,
): (initial?: undefined) => StateManager<Value, Error>
export function commonStateFactory<Value, Error = unknown>(
  stateStorage: (
    initial: Value | (() => Value),
  ) => [CacheableState<Value, Error, Value>, Dispatch<SetStateAction<CacheableState<Value, Error, Value>>>, Value],
  refreshStore: (refresh: RefreshCallback, beforeHardRefresh: RefreshCallback) => Refreshable,
): (initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function commonStateFactory<Value, Error = unknown, Initial = unknown>(
  stateStorage: (
    initial: Initial | (() => Initial),
  ) => [
    CacheableState<Value, Error, Initial>,
    Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
    Initial,
  ],
  refreshStore: (refresh: RefreshCallback, beforeHardRefresh: RefreshCallback) => Refreshable,
): (initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial>

export function commonStateFactory<Value, Error, Initial>(
  stateStorage: (
    initial: Initial | (() => Initial),
  ) => [
    CacheableState<Value, Error, Initial>,
    Dispatch<SetStateAction<CacheableState<Value, Error, Initial>>>,
    Initial,
  ],
  refreshStore: (refresh: RefreshCallback, beforeHardRefresh: RefreshCallback) => Refreshable,
): (initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  return (initial) => {
    const createCancelableFactory = useCancelableFactory()
    const { addToCancelablePool, clearCancelablePool } = useCancelablePool()
    const { memoizedRequest } = useRequestMemo()
    const isMounted = useIsMounted()
    const refreshRef = useRef<StateRefreshOption<Value, Error, Initial>>()

    const { softRefresh, hardRefresh } = refreshStore(
      () => {
        const throwErrorOnRefresh = async () => {
          throw NOT_PROVIDED_REFRESH_FUNCTION
        }
        const request = refreshRef.current?.refreshFn ?? throwErrorOnRefresh
        const key = refreshRef.current?.requestKey ?? ''
        // important save onError callback on init request, for handle changing callback during waiting request
        const onError = refreshRef.current?.onError
        const makeRequest = () => {
          const { makeCancellable, cancel } = createCancelableFactory()
          // wrap to memorization and cancelable (think about providing uniq key of related request to refreshRef)
          const cancellableRequest = { cancel, cancellablePromise: makeCancellable(memoizedRequest(key, request)) }
          addToCancelablePool(key, cancellableRequest)
          return cancellableRequest
        }

        const cancellable = makeRequest()

        const tryUpdate = async () => {
          try {
            setState(
              (prevState) =>
                ({
                  ...prevState,
                  isLoading: true,
                  error: undefined,
                } as NotErrorCacheable<Value, Error, Initial>),
            )
            const _value = await cancellable.cancellablePromise
            // if not mounted doesn't update state
            if (isMounted()) {
              setState(() => ({
                value: _value,
                error: undefined,
                isActual: true,
                isLoading: false,
                cached: _value,
                key,
              }))
            }
          } catch (error) {
            // if not mounted doesn't update state
            if (!isMounted()) {
              return
            }
            // if canceled finish loading
            if (error === CANCEL_PROMISE) {
              setState((prevState) => ({ ...prevState, isLoading: false }))
            } else {
              setState((prevState) => {
                const newState = {
                  ...prevState,
                  value: _initial,
                  isActual: true,
                  isLoading: false,
                  error: error as Error,
                }
                onError && onError(error as Error, newState)
                return newState
              })
            }
          }
        }
        tryUpdate()
        return cancellable.cancel
      },
      () => {
        clearCancelablePool()
        setState((prevState) => ({ ...prevState, isActual: false }))
      },
    )

    const [state, setState, _initial] = stateStorage(initial)

    return useMemo<StateManager<Value, Error, Initial>>(
      () => ({
        state: {
          ...state,
          softRefresh,
          hardRefresh,
        },
        setRefresh: (options) => (refreshRef.current = options),
        resetStateActuality: () => {
          setState((prev) => ({ ...prev, isActual: false, key: refreshRef.current?.requestKey ?? '' }))
        },
        setState,
      }),
      [state],
    )
  }
}
