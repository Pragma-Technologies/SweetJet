import { useCallback, useEffect, useRef } from 'react'

export const useIsMounted = (): (() => boolean) => {
  const isMountedRef = useRef(true)

  useEffect(() => () => void (isMountedRef.current = false), [])

  return useCallback(() => isMountedRef.current, [])
}
