import { renderHook } from '@testing-library/react-hooks'
import { ColorConstant, ThemeName } from '../types'
import { useThemeLayoutEffect } from './index'

describe('useThemeLayoutEffect', () => {
  const lightColors: ColorConstant<string> = { primary: '#FFF', secondary: '#000' }
  const darkColors: ColorConstant<string> = { primary: '#000', secondary: '#FFF' }

  it('should add a style element to the head and add class to the body', () => {
    const { rerender } = renderHook(
      ([themeName, lightColors, darkColors]) =>
        useThemeLayoutEffect(
          themeName as ThemeName,
          lightColors as ColorConstant<string>,
          darkColors as ColorConstant<string>,
        ),
      { initialProps: ['light', lightColors, darkColors] },
    )

    expect(document.head.innerHTML).toContain('body.light')
    expect(document.head.innerHTML).toContain('body.dark')
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('dark')

    rerender(['light', lightColors, darkColors])
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('dark')

    rerender(['dark', lightColors, darkColors])
    expect(document.body.classList).toContain('dark')
    expect(document.body.classList).not.toContain('light')

    rerender(['light', lightColors, darkColors])
    expect(document.body.classList).toContain('light')
    expect(document.body.classList).not.toContain('dark')
  })
})
