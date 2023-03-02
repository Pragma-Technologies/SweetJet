import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'
import { useQuery } from './useQuery'

describe('useQuery', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    })
  })

  it('should call setTheme with the correct theme name', () => {
    const setThemeMock = jest.fn()

    renderHook(() => useQuery('pink', 'brown', setThemeMock))
    expect(setThemeMock).toHaveBeenCalledWith('brown')
  })

  it('should set theme based on media query', () => {
    const setThemeMock = jest.fn()

    renderHook(() => useQuery('brown', 'pink', setThemeMock))

    act(() => {
      window.matchMedia = jest.fn().mockReturnValue({ matches: false })
      window.dispatchEvent(new Event('change'))
    })

    expect(setThemeMock).toHaveBeenCalledWith('pink')
  })
})
