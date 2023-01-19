import { useCallback, useRef } from 'react'

type Debounce = (callback: () => void, delay?: number) => void

export function useDebounce(defaultDelay = 1_000): Debounce {
  const delayRef = useRef<NodeJS.Timeout>()
  return useCallback<Debounce>(
    (callback, delay: number = defaultDelay) => {
      clearTimeout(delayRef.current)

      if (delay) {
        delayRef.current = setTimeout(callback, delay)
      } else {
        callback()
      }
    },
    [defaultDelay],
  )
}
