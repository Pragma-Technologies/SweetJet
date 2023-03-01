import { useEffect } from 'react'

export const useListenMediaQueryMatches = (
  query: MediaQueryList | undefined,
  themeName: string,
  setTheme: (name: string) => void,
): void => {
  return useEffect(() => {
    if (!query) {
      return
    }

    const themeListener = () => setTheme(themeName)
    query.addEventListener('change', themeListener)
    return () => query.removeEventListener('change', themeListener)
  }, [])
}
