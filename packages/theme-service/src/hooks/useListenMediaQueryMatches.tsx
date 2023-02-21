import { useEffect } from 'react'
import { ThemeName } from '../types'

export const useListenMediaQueryMatches = (
  query: MediaQueryList | undefined,
  setTheme: (name: ThemeName) => void,
): void => {
  return useEffect(() => {
    if (!query) {
      return
    }

    const themeListener = (media: MediaQueryListEvent) => setTheme(media.matches ? 'dark' : 'light')
    query.addEventListener('change', themeListener)
    return () => query.removeEventListener('change', themeListener)
  }, [])
}
