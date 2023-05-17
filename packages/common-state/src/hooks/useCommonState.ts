// hook types overloading
import { useCancelableFactory, useCancelablePool, useIsMounted, useRequestMemo } from '@pragma-web-utils/hooks'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CANCEL_PROMISE, NOT_PROVIDED_REFRESH_FUNCTION } from '../constants'
import { CacheableState, ErrorState, StateManager, StateRefreshOption } from '../types'

type NotErrorCacheable<T, E, I> = Exclude<CacheableState<T, E, I>, ErrorState<I, E>>

export function useCommonState<Value, Error = unknown>(initial?: undefined): StateManager<Value | undefined, Error>
export function useCommonState<Value, Error = unknown>(initial: Value | (() => Value)): StateManager<Value, Error>

export function useCommonState<Value, Error = unknown, Initial = Value>(
  initial: Initial | (() => Initial),
): StateManager<Value, Error, Initial> {
  const createCancelableFactory = useCancelableFactory()
  const { addToCancelablePool, clearCancelablePool } = useCancelablePool()
  const { memoizedRequest } = useRequestMemo()
  const isMounted = useIsMounted()
  const refreshRef = useRef<StateRefreshOption<Value, Error, Initial>>()
  // if initial is dispatch function call it ones for get value (imitate useState common logic)
  const [_initial] = useState<Initial>(initial)
  const [state, setState] = useState<CacheableState<Value, Error, Initial>>({
    value: _initial,
    isLoading: false,
    isActual: false,
    error: undefined,
    cached: _initial,
  })

  const refreshCallback = useCallback(() => {
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
          setState(() => ({ value: _value, error: undefined, isActual: true, isLoading: false, cached: _value }))
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
            const newState = { ...prevState, value: _initial, isActual: true, isLoading: false, error: error as Error }
            onError && onError(error as Error, newState)
            return newState
          })
        }
      }
    }
    tryUpdate()
    return cancellable.cancel
  }, [])

  return useMemo<StateManager<Value, Error, Initial>>(
    () => ({
      state: {
        ...state,
        softRefresh: refreshCallback,
        hardRefresh: () => {
          clearCancelablePool()
          setState((prevState) => ({ ...prevState, isActual: false }))
          return refreshCallback()
        },
      },
      setRefresh: (options) => (refreshRef.current = options),
      setState,
    }),
    [state],
  )
}
