import { useEffect } from 'react'

export const useQuery = <ThemeNames extends string>(
  lightName: ThemeNames,
  darkName: ThemeNames,
  setTheme: (themeName: ThemeNames) => void,
): void => {
  const mediaQueryList: MediaQueryList | undefined =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')

  return useEffect(() => {
    if (!mediaQueryList) {
      return
    }

    const themeListener = (media: MediaQueryListEvent) => setTheme(media.matches ? darkName : lightName)
    mediaQueryList.addEventListener('change', themeListener)
    return () => mediaQueryList.removeEventListener('change', themeListener)
  }, [lightName, darkName])
}
