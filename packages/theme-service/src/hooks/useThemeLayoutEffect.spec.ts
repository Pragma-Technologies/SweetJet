import { renderHook } from '@testing-library/react-hooks'
import { ColorConstant, ThemeConfig } from '../types'
import { useThemeLayoutEffect } from './index'

describe('useThemeLayoutEffect', () => {
  const lightColors: ColorConstant<string> = { primary: '#FFF', secondary: '#000' }
  const pinkColors: ColorConstant<string> = { primary: '#000', secondary: '#FFF' }
  const brownColors: ColorConstant<string> = { primary: '#000', secondary: '#FFF' }

  type ThemeName = 'pink' | 'light' | 'brown'
  type Config = ThemeConfig<ThemeName, string, undefined, undefined>
  const themeConfig: Config = {
    pink: { colors: pinkColors },
    light: { colors: lightColors },
    brown: { colors: brownColors },
  }

  it('should add a style element to the head and add class to the body', () => {
    const { rerender } = renderHook(
      ([themeName, themeConfig]) => useThemeLayoutEffect(themeName as ThemeName, themeConfig as Config),
      { initialProps: ['light', themeConfig] },
    )

    expect(document.head.innerHTML).toContain('body.light')
    expect(document.head.innerHTML).toContain('body.pink')
    expect(document.head.innerHTML).toContain('body.brown')
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('pink')
    expect(document.body.classList).not.toContain('brown')

    rerender(['light', themeConfig])
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('pink')
    expect(document.body.classList).not.toContain('brown')

    rerender(['pink', themeConfig])
    expect(document.body.classList).toContain('pink')
    expect(document.body.classList).not.toContain('light')
    expect(document.body.classList).not.toContain('brown')

    rerender(['light', themeConfig])
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('pink')
    expect(document.body.classList).not.toContain('brown')

    rerender(['brown', themeConfig])
    expect(document.body.classList).toContain('brown')
    expect(document.body.classList).not.toContain('pink')
    expect(document.body.classList).not.toContain('light')
  })
})
