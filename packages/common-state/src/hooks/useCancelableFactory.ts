import { useMemo, useRef } from 'react'
import { CANCEL_PROMISE } from '../constants'
import { CancellableFactory, CancellableFactoryFactory, CancellablePromise } from '../types'
import { useIsMounted } from './useIsMounted'

export const useCancelableFactory = (): CancellableFactoryFactory => {
  const isMounted = useIsMounted()
  const cancelablePool = useRef<Record<string, CancellablePromise[]>>({})

  return useMemo<CancellableFactoryFactory>(
    () => ({
      async addToCancelablePool(key: string, value: CancellablePromise) {
        if (!cancelablePool.current[key]) {
          cancelablePool.current[key] = []
        }
        cancelablePool.current[key].push(value)
        try {
          await value.cancellablePromise
        } catch (e) {
        } finally {
          if (key in cancelablePool.current) {
            cancelablePool.current[key] = cancelablePool.current[key].filter((cancelable) => cancelable !== value)
          }
        }
      },
      clearCancelablePool(...exceptedKeys) {
        Object.entries(cancelablePool.current).forEach(([key, value]) => {
          if (exceptedKeys.includes(key)) {
            return
          }
          value.forEach((cancelable) => cancelable.cancel())
          delete cancelablePool.current[key]
        })
      },
      createCancelableFactory(onCancel): CancellableFactory {
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
      },
    }),
    [],
  )
}
