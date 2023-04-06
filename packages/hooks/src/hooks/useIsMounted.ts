import { useCallback, useEffect, useRef } from 'react'

export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => void (isMountedRef.current = false)
  }, [])

  return useCallback(() => isMountedRef.current, [])
}
