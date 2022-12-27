import { useMemo, useRef } from 'react'
import { CancellablePool, CancellablePromise } from '../types'

export const useCancelablePool = (): CancellablePool => {
  const cancelablePool = useRef<Record<string, CancellablePromise[]>>({})

  return useMemo<CancellablePool>(
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
        const _set = new Set(exceptedKeys)
        Object.entries(cancelablePool.current).forEach(([key, value]) => {
          if (_set.has(key)) {
            return
          }
          value.forEach((cancelable) => cancelable.cancel())
          delete cancelablePool.current[key]
        })
      },
    }),
    [],
  )
}
