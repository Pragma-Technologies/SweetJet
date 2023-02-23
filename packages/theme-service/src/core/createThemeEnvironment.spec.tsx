import { fireEvent, render } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
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

  it('should return the correct hook', () => {
    expect(hook).toBeInstanceOf(Function)
  })

  it('should render the wrapper', () => {
    expect(ThemeWrapper).toBeDefined()
  })

  it('should render the component with the correct props', () => {
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

  it('should toggle the themeName when toggleTheme is called', () => {
    // const lightButtonSpan = 'ChooseLight'

    // const DarkButton: React.FC = () => <button onClick={() => onClick('dark')}>ChooseDark</button>
    // const LightButton: React.FC = () => <button onClick={() => onClick('light')}>{lightButtonSpan}</button>
    // const onClick = jest.fn((themeName: ThemeName) => renderHook(() => hook().setTheme(themeName)))

    const renderComponent = render(
      <ThemeWrapper>
        {/* <DarkButton /> */}
        <button data-testid="darkToggle" onClick={() => jest.fn(() => renderHook(() => hook().setTheme('dark')))}>
          Choose Dark
        </button>
        {/* <LightButton /> */}
        <button data-testid="lightToggle" onClick={() => jest.fn(() => renderHook(() => hook().setTheme('light')))}>
          Choose Light
        </button>
      </ThemeWrapper>,
    )

    const { themeName } = renderHook(() => hook()).result.current

    expect(themeName).toContain('light')

    fireEvent.click(renderComponent.getByTestId('darkToggle'))

    expect(themeName).toContain('dark')

    fireEvent.click(renderComponent.getByTestId('darkToggle'))

    expect(themeName).toContain('light')
  })
})
