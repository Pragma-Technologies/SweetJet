import { renderHook } from '@testing-library/react-hooks'
import { ColorConstant, ThemeName } from '../types'
import { useThemeLayoutEffect } from './index'

describe('useThemeLayoutEffect', () => {
  const lightColors: ColorConstant<string> = { primary: '#FFF', secondary: '#000' }
  const darkColors: ColorConstant<string> = { primary: '#000', secondary: '#FFF' }

  it('should add a style element to the head and add the light class to the body', () => {
    const themeName = 'light' as ThemeName

    const { rerender } = renderHook(() => useThemeLayoutEffect(themeName, lightColors, darkColors))

    expect(document.head.innerHTML).toContain('body.light')
    expect(document.body.classList).toContain('light')

    rerender({ themeName, lightColors, darkColors })

    expect(document.head.innerHTML).toContain('body.light')
    expect(document.body.classList).toContain('light')

    rerender({ themeName: 'dark', lightColors, darkColors })
    expect(document.head.innerHTML).toContain('body.dark')
  })

  it('should add a style element to the head and add the dark class to the body', () => {
    const themeName = 'dark' as ThemeName

    const { rerender } = renderHook(() => useThemeLayoutEffect(themeName, lightColors, darkColors))

    expect(document.head.innerHTML).toContain('body.dark')
    expect(document.body.classList).toContain('dark')

    rerender({ themeName, lightColors, darkColors })

    expect(document.head.innerHTML).toContain('body.dark')
    expect(document.body.classList).toContain('dark')

    rerender({ themeName: 'light', lightColors, darkColors })
    expect(document.head.innerHTML).toContain('body.light')
  })

  it('should remove all themes and add the new theme', () => {
    renderHook(() => useThemeLayoutEffect('light', lightColors, darkColors))

    expect(document.body.classList).not.toContain('dark')
    expect(document.body.classList).toContain('light')
  })
})
