import { renderHook } from '@testing-library/react-hooks'
import { ThemeName } from '../types'
import { useListenMediaQueryMatches } from './index'

describe('useListenMediaQueryMatches', () => {
  let themeName: ThemeName = 'light'
  const setTheme = (name: ThemeName) => (themeName = name)
  const mediaQuery = '(prefers-color-scheme: dark)'

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === mediaQuery,
        media: query,
        onchange: null,
        addEventListener: jest.fn(() => setTheme(query === mediaQuery ? 'dark' : 'light')),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('default theme another with user system theme ', () => {
    themeName = 'light'
    expect(themeName).toBe('light')
    renderHook(() => useListenMediaQueryMatches(window.matchMedia('(prefers-color-scheme: dark)'), setTheme))
    expect(themeName).toBe('dark')
  })

  it('default theme same with user system theme', () => {
    themeName = 'light'
    expect(themeName).toBe('light')
    renderHook(() => useListenMediaQueryMatches(window.matchMedia('(prefers-color-scheme: light)'), setTheme))
    expect(themeName).toBe('light')
  })

  it('write wrong theme name', () => {
    themeName = 'light'
    expect(themeName).toBe('light')
    renderHook(() => useListenMediaQueryMatches(window.matchMedia('(prefers-color-scheme: wrong)'), setTheme))
    expect(themeName).toBe('light')
  })
})
