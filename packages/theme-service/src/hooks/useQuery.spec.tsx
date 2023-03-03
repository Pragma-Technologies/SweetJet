import { renderHook } from '@testing-library/react-hooks'
import { act } from 'react-dom/test-utils'
import { useQuery } from './useQuery'

const listeners: Set<(this: MediaQueryList, ev: { matches: boolean }) => any> = new Set()

const mediaQueryList = {
  matches: true,
  media: '',
  addEventListener(type: 'change' | string, listener: (this: MediaQueryList, ev: { matches: boolean }) => any) {
    if (type === 'change') {
      listeners.add(listener)
    }
  },
  removeEventListener(type: 'change' | string, listener: (this: MediaQueryList, ev: { matches: boolean }) => any) {
    listeners.delete(listener)
  },
  dispatchEvent(event: { matches: boolean }): boolean {
    listeners.forEach((listener) => listener.call(mediaQueryList, event))
    return true
  },
  onchange(ev: { matches: boolean }): void {
    mediaQueryList.dispatchEvent(ev as MediaQueryListEvent)
  },
} as unknown as MediaQueryList

describe('useQuery', () => {
  beforeAll(() => {
    window.matchMedia = () => mediaQueryList
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
      mediaQueryList.dispatchEvent({ matches: false } as MediaQueryListEvent)
    })

    expect(setThemeMock).toHaveBeenCalledWith('pink')
  })

  it('check memory management', () => {
    const setThemeMock = jest.fn()

    const { rerender, unmount } = renderHook(
      ([lightName, darkName]: [string, string]) => useQuery(lightName, darkName, setThemeMock),
      { initialProps: ['brown', 'pink'] },
    )

    expect(listeners.size).toBe(1)

    rerender(['pink', 'brown'])

    expect(listeners.size).toBe(1)

    unmount()

    expect(listeners.size).toBe(0)
  })
})
