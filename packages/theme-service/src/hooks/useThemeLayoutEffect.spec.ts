import { renderHook } from '@testing-library/react-hooks'
import { useThemeLayoutEffect } from './index'
import { ColorConstant, ThemeName } from '../types'

describe('useThemeLayoutEffect', () => {
  const lightColors: ColorConstant<string> = { primary: '#FFF', secondary: '#000' }
  const darkColors: ColorConstant<string> = { primary: '#000', secondary: '#FFF' }

  it('should add a style element to the head and add the light class to the body', () => {
    const themeName = 'light' as ThemeName

    renderHook(() => useThemeLayoutEffect(themeName, lightColors, darkColors))
    expect(document.head.innerHTML).toContain('body.light')
    expect(document.body.classList).toContain('light')
  })

  it('should add a style element to the head and add the dark class to the body', () => {
    const themeName = 'dark' as ThemeName

    renderHook(() => useThemeLayoutEffect(themeName, lightColors, darkColors))
    expect(document.head.innerHTML).toContain('body.dark')
    expect(document.body.classList).toContain('dark')
  })
})
