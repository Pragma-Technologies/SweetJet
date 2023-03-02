import { useEffect } from 'react'
import { ThemeContextType } from '../types'

export const useQuery = <
  ThemeNames extends string,
  Colors extends string,
  ThemedIcons extends Record<string, unknown> | undefined,
  ThemedImages extends Record<string, unknown> | undefined,
>(
  query: MediaQueryList | undefined,
  lightName: ThemeNames,
  darkName: ThemeNames,
  useTheme: () => ThemeContextType<ThemeNames, Colors, ThemedIcons, ThemedImages>,
): void => {
  const { setTheme } = useTheme()

  return useEffect(() => {
    if (!query) {
      return
    }

    const themeListener = (media: MediaQueryListEvent) => setTheme(media.matches ? darkName : lightName)
    query.addEventListener('change', themeListener)
    return () => query.removeEventListener('change', themeListener)
  }, [lightName, darkName])
}
