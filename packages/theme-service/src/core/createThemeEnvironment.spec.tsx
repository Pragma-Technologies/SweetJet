import { fireEvent, render } from '@testing-library/react'
import { ColorConstant, ThemeContextType } from '../types'
import { createThemeEnvironment } from './index'

describe('createThemeEnvironment', () => {
  type TestColorsConst = 'primary' | 'secondary'
  type IconsConfig = { icon: string }
  type ImageConfig = { image: string }
  type TestThemeContext = ThemeContextType<TestColorsConst, IconsConfig, ImageConfig>

  const lightColors: ColorConstant<TestColorsConst> = { primary: '#FFF', secondary: '#000' }
  const darkColors: ColorConstant<TestColorsConst> = { primary: '#000', secondary: '#FFF' }
  const iconsSets = { light: { icon: 'lightIcon' }, dark: { icon: 'darkIcon' } }
  const imagesSets = { light: { image: 'darkIcon' }, dark: { image: 'darkIcon' } }

  const { hook, wrapper: ThemeWrapper } = createThemeEnvironment<
    TestThemeContext,
    TestColorsConst,
    IconsConfig,
    ImageConfig
  >('TestContext', undefined, lightColors, darkColors, iconsSets, imagesSets)

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
      <ThemeWrapper defaultTheme="dark">
        <TestComponent />
      </ThemeWrapper>,
    )
    expect(renderComponentDark.container.textContent).toBe('dark')
  })

  it('should toggle the theme when toggleTheme is called', () => {
    const buttonLabel = 'Toggle Theme'
    let themeName
    let icon
    let image

    const Component = () => {
      themeName = hook().themeName
      icon = hook().icons
      image = hook().images

      return <button onClick={hook().toggleTheme}>{buttonLabel}</button>
    }

    const { getByText } = render(
      <ThemeWrapper defaultTheme="dark">
        <Component />
      </ThemeWrapper>,
    )

    expect(themeName).toBe('dark')
    expect(icon).toStrictEqual(iconsSets.dark)
    expect(image).toStrictEqual(imagesSets.dark)

    fireEvent.click(getByText(buttonLabel)) // Call toggleTheme again dark->light

    expect(themeName).toBe('light')
    expect(icon).toStrictEqual(iconsSets.light)
    expect(image).toStrictEqual(imagesSets.light)

    fireEvent.click(getByText(buttonLabel)) // Call toggleTheme again light->dark

    expect(themeName).toBe('dark')
    expect(icon).toStrictEqual(iconsSets.dark)
    expect(image).toStrictEqual(imagesSets.dark)
  })

  it('should toggle the theme when toggleTheme is called with icon and image undefined', () => {
    const { hook, wrapper: ThemeWrapper } = createThemeEnvironment<
      TestThemeContext,
      TestColorsConst,
      undefined,
      undefined
    >('TestContext', undefined, lightColors, darkColors)

    const buttonLabel = 'Toggle Theme'
    let themeName
    let icon
    let image

    const Component = () => {
      themeName = hook().themeName
      icon = hook().icons
      image = hook().images

      return <button onClick={hook().toggleTheme}>{buttonLabel}</button>
    }

    const { getByText } = render(
      <ThemeWrapper defaultTheme="dark">
        <Component />
      </ThemeWrapper>,
    )

    expect(themeName).toBe('dark')
    expect(icon).toStrictEqual(undefined)
    expect(image).toStrictEqual(undefined)

    fireEvent.click(getByText(buttonLabel))

    expect(themeName).toBe('light')
    expect(icon).toStrictEqual(undefined)
    expect(image).toStrictEqual(undefined)
  })
})
