// hook types overloading
import { useCancelableFactory, useCancelablePool, useIsMounted, useRequestMemo } from '@pragma-web-utils/hooks'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CANCEL_PROMISE } from '../constants'
import { CacheableState, StateManager, StateRefreshOption } from '../types'

export function useCommonState<Value, Error = unknown>(initial?: undefined): StateManager<Value | undefined, Error>
export function useCommonState<Value, Error = unknown>(initial: Value | (() => Value)): StateManager<Value, Error>

export function useCommonState<Value, Error = unknown>(initial: Value): StateManager<Value, Error> {
  const createCancelableFactory = useCancelableFactory()
  const { addToCancelablePool, clearCancelablePool } = useCancelablePool()
  const { memoizedRequest } = useRequestMemo()
  const isMounted = useIsMounted()
  const refreshRef = useRef<StateRefreshOption<Value, Error>>()
  const [state, setState] = useState<CacheableState<Value, Error>>({
    value: initial,
    isLoading: false,
    isActual: !!initial,
    error: undefined,
    cached: initial,
  })

  const refreshCallback = useCallback(() => {
    const getInitial = async () => initial
    const request = refreshRef.current?.refreshFn ?? getInitial
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
        setState((prevState) => ({ ...prevState, isLoading: true, error: undefined }))
        const _value = await cancellable.cancellablePromise
        // if not mounted doesn't update state
        if (isMounted()) {
          setState((prevState) => ({ ...prevState, value: _value, isActual: true, isLoading: false, cached: _value }))
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
            const newState = { ...prevState, value: initial, isActual: true, isLoading: false, error: error as Error }
            onError && onError(error as Error, newState)
            return newState
          })
        }
      }
    }
    tryUpdate()
    return cancellable.cancel
  }, [])

  return useMemo<StateManager<Value, Error>>(
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
