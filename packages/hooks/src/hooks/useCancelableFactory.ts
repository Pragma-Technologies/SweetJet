import { useCallback } from 'react'
import { CANCEL_PROMISE } from '../constants'
import { CreateCancelableFactory } from '../types'
import { useIsMounted } from './useIsMounted'

export const useCancelableFactory = (): CreateCancelableFactory => {
  const isMounted = useIsMounted()

  return useCallback<CreateCancelableFactory>((onCancel) => {
    let isCanceled = false

    return {
      makeCancellable: <T>(promise: Promise<T>) =>
        new Promise<T>((resolve, reject) => {
          promise
            .then((data) => (isCanceled || !isMounted() ? reject(CANCEL_PROMISE) : resolve(data)))
            .catch((error) => (isCanceled || !isMounted() ? reject(CANCEL_PROMISE) : reject(error)))
        }),
      makeUnmountable: <T>(promise: Promise<T>) =>
        new Promise<T>((resolve, reject) => {
          promise
            .then((data) => (!isMounted() ? reject(CANCEL_PROMISE) : resolve(data)))
            .catch((error) => (!isMounted() ? reject(CANCEL_PROMISE) : reject(error)))
        }),
      cancel: () => {
        !!onCancel && onCancel()
        void (isCanceled = true)
      },
    }
  }, [])
}
