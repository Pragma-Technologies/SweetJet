// hook types overloading
import { useCancelableFactory, useCancelablePool, useIsMounted, useRequestMemo } from '@pragma-web-utils/hooks'
import { useCallback, useMemo, useRef, useState } from 'react'
import { CANCEL_PROMISE } from '../constants'
import { CacheableState, CommonState, StateRefreshOption } from '../types'

export function useCommonState<Value, Error = unknown>(initial?: undefined): CommonState<Value | undefined, Error>
export function useCommonState<Value, Error = unknown>(initial: Value | (() => Value)): CommonState<Value, Error>

export function useCommonState<Value, Error = unknown>(initial: Value): CommonState<Value, Error> {
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
    const makeRequest = () => {
      const request = refreshRef.current?.refreshFn ?? getInitial
      const key = refreshRef.current?.requestKey ?? ''
      const error = refreshRef.current?.onError
      const { makeCancellable, cancel } = createCancelableFactory()
      // wrap to memorization and cancelable (think about providing uniq key of related request to refreshRef)
      const cancellableRequest = { cancel, cancellablePromise: makeCancellable(memoizedRequest(key, request)), error }
      addToCancelablePool(key, cancellableRequest)
      return cancellableRequest
    }

    const cancellable = makeRequest()

    const tryUpdate = async () => {
      try {
        setState((prevState) => ({ ...prevState, isLoading: true, error: undefined }))
        const _value = await cancellable.cancellablePromise
        if (isMounted()) {
          setState((prevState) => ({ ...prevState, value: _value, isActual: true, isLoading: false, cached: _value }))
        }
      } catch (error) {
        if (error !== CANCEL_PROMISE && isMounted()) {
          const _error = await cancellable.error
          setState((prevState) => {
            const newState = { ...prevState, value: initial, isActual: true, isLoading: false, error: error as Error }
            _error && _error(error as Error, newState)
            return newState
          })
        }
      }
    }
    tryUpdate()
    return cancellable.cancel
  }, [])

  return useMemo<CommonState<Value, Error>>(
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
