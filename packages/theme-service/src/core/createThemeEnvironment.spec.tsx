import { fireEvent, screen, render } from '@testing-library/react'
import { useEffect } from 'react'
import { ColorConstant, ThemeContextType } from '../types'
import { createThemeEnvironment } from './index'
import { renderHook } from '@testing-library/react-hooks'

describe('createThemeEnvironment', () => {
  type TestColorsConst = 'primary' | 'secondary'
  type IconsConfig = { icon: string }
  type ImageConfig = { image: string }
  const iconsSets = { light: { icon: 'lightIcon' }, pink: { icon: 'pinkIcon' }, brown: { icon: 'brownIcon' } }
  const imagesSets = { light: { image: 'darkImage' }, pink: { image: 'pinkImage' }, brown: { image: 'brownImage' } }

  const lightColors: ColorConstant<TestColorsConst> = { primary: '#FFF', secondary: '#000' }
  const brownColors: ColorConstant<TestColorsConst> = { primary: '#000', secondary: '#FFF' }
  const pinkColors: ColorConstant<TestColorsConst> = { primary: '#F5F5F5', secondary: '#222222' }

  type ThemeName = 'pink' | 'light' | 'brown'

  const themeConfig = {
    pink: { colors: pinkColors, icons: iconsSets.pink, images: imagesSets.pink },
    light: { colors: lightColors, icons: iconsSets.light, images: imagesSets.light },
    brown: { colors: brownColors, icons: iconsSets.brown, images: imagesSets.brown },
  }

  type TestThemeContext = ThemeContextType<ThemeName, TestColorsConst, IconsConfig, ImageConfig>
  const { hook, wrapper: ThemeWrapper } = createThemeEnvironment<
    TestThemeContext,
    ThemeName,
    TestColorsConst,
    IconsConfig,
    ImageConfig
  >('TestContext', themeConfig)

  let updateTheme = jest.fn()
  it('should return the correct hook and wrapper', () => {
    expect(hook).toBeDefined()
    expect(hook).toBeInstanceOf(Function)
    expect(ThemeWrapper).toBeDefined()
    expect(ThemeWrapper).toBeInstanceOf(Function)
  })

  it('should render the component with the correct defaultTheme', () => {
    const TestComponent = () => {
      const contextValue = hook()
      return <div>{contextValue.themeName}</div>
    }

    const renderedComponent = render(
      <ThemeWrapper defaultTheme="light">
        <TestComponent />
      </ThemeWrapper>,
    )

    expect(renderedComponent.container.textContent).toBe('light')

    const renderComponentDark = render(
      <ThemeWrapper defaultTheme="brown">
        <TestComponent />
      </ThemeWrapper>,
    )
    expect(renderComponentDark.container.textContent).toBe('brown')
  })

  it('should toggle the theme when toggleTheme is called', () => {
    const buttonLabel = 'Toggle Theme'
    let themeName
    let icon
    let image

    const Component = () => {
      themeName = hook().themeName
      const _updateTheme = hook().setTheme
      icon = hook().themeConfig[themeName].icons
      image = hook().themeConfig[themeName].images

      useEffect(() => {
        updateTheme = jest.fn(_updateTheme)
      }, [])

      return <button onClick={() => updateTheme('brown')}>{buttonLabel}</button>
    }

    const { getByText } = render(
      <ThemeWrapper defaultTheme="pink">
        <Component />
      </ThemeWrapper>,
    )

    expect(themeName).toBe('pink')
    expect(icon).toStrictEqual(iconsSets.pink)
    expect(image).toStrictEqual(imagesSets.pink)

    fireEvent.click(getByText(buttonLabel))

    expect(themeName).toBe('brown')
    expect(icon).toStrictEqual(iconsSets.brown)
    expect(image).toStrictEqual(imagesSets.brown)
  })

  it('should toggle the theme when toggleTheme is called with icon and image undefined', () => {
    const themeConfig = { pink: { colors: pinkColors }, light: { colors: lightColors }, brown: { colors: brownColors } }
    const { hook, wrapper: ThemeWrapper } = createThemeEnvironment<
      TestThemeContext,
      ThemeName,
      TestColorsConst,
      undefined,
      undefined
    >('TestContext', themeConfig)

    const buttonLabel = 'Toggle Theme'
    let themeName
    let icon
    let image

    const Component = () => {
      themeName = hook().themeName
      icon = hook().themeConfig[themeName].icons
      image = hook().themeConfig[themeName].images

      const onClick = () => renderHook(() => hook().setTheme('light'))
      return <button onClick={onClick}>{buttonLabel}</button>
    }

    const { getByText } = render(
      <ThemeWrapper defaultTheme="pink">
        <Component />
      </ThemeWrapper>,
    )

    expect(themeName).toBe('pink')
    expect(icon).toStrictEqual(undefined)
    expect(image).toStrictEqual(undefined)

    fireEvent.click(getByText(buttonLabel))

    expect(themeName).toBe('light')
    expect(icon).toStrictEqual(undefined)
    expect(image).toStrictEqual(undefined)
  })
})
