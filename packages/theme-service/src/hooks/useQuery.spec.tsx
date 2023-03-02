import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'
import { useQuery } from './useQuery'

describe('useQuery', () => {
  it('should call setTheme with the correct theme name', () => {
    let themeName
    const setThemeMock = jest.fn((name) => (themeName = name))

    renderHook(() => useQuery('pink', 'brown', setThemeMock))
    expect(themeName).toBe('brown')
  })

  it('should set theme based on media query', () => {
    let themeName
    const setThemeMock = jest.fn((name) => (themeName = name))
    window.matchMedia = jest.fn().mockReturnValue({})

    renderHook(() => useQuery('pink', 'brown', setThemeMock))

    act(() => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: true })
      window.dispatchEvent(new Event('change'))
    })

    expect(themeName).toBe('brown')
  })
})
