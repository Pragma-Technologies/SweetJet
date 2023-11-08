// hook types overloading
import { useCancelableFactory, useCancelablePool, useIsMounted, useRequestMemo } from '@pragma-web-utils/hooks'
import { useRef } from 'react'
import { CANCEL_PROMISE, NOT_PROVIDED_REFRESH_FUNCTION } from '../constants'
import { CacheableState, ErrorState, StateManager, StateRefreshOption, StateStoreFactory } from '../types'

type NotErrorCacheable<T, E, I> = Exclude<CacheableState<T, E, I>, ErrorState<I, E>>

export function commonStateFactory<Value, Error = unknown>(
  stateStorage: StateStoreFactory<Value, Error>,
): (initial?: undefined) => StateManager<Value, Error>
export function commonStateFactory<Value, Error = unknown>(
  stateStorage: StateStoreFactory<Value, Error, Value>,
): (initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function commonStateFactory<Value, Error = unknown, Initial = unknown>(
  stateStorage: StateStoreFactory<Value, Error, Initial>,
): (initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial>

export function commonStateFactory<Value, Error, Initial>(
  stateStorage: StateStoreFactory<Value, Error, Initial>,
): (initial: Initial | (() => Initial)) => StateManager<Value, Error, Initial> {
  return (initial) => {
    const createCancelableFactory = useCancelableFactory()
    const { addToCancelablePool, clearCancelablePool } = useCancelablePool()
    const { memoizedRequest } = useRequestMemo()
    const isMounted = useIsMounted()
    const refreshRef = useRef<StateRefreshOption<Value, Error, Initial>>()

    const { state, setState, refreshable } = stateStorage({
      initial,
      refresh: (initial, setState) => {
        const throwErrorOnRefresh = async () => {
          throw NOT_PROVIDED_REFRESH_FUNCTION
        }
        const request = async () => {
          // wait finish all child components useEffects with init refresh and init refresh function in parent component
          await Promise.resolve()
          // call refresh callback after all useEffects
          return (refreshRef.current?.refreshFn ?? throwErrorOnRefresh)()
        }
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
                  value: initial,
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
      beforeRefresh: () => {
        clearCancelablePool()
        setState((prevState) => ({ ...prevState, isActual: false }))
      },
    })

    return {
      state: {
        ...state,
        ...refreshable,
      },
      setRefresh: (options) => (refreshRef.current = options),
      resetStateActuality: () => {
        setState((prev) => ({ ...prev, isActual: false, key: refreshRef.current?.requestKey ?? '' }))
      },
      setState,
    }
  }
}
