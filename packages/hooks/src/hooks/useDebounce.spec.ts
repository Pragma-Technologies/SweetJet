import { renderHook } from '@testing-library/react-hooks'
import { useDebounce } from './useDebounce'

describe('useDebounce hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('check default delay', async () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useDebounce())

    result.current(callback)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(500)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(500)

    expect(callback).toBeCalledTimes(1)
  })

  it('check custom delay', async () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useDebounce())

    result.current(callback, 2000)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(1500)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(500)

    expect(callback).toBeCalledTimes(1)
  })

  it('check debounce', async () => {
    const callback = jest.fn()
    const { result } = renderHook(() => useDebounce())

    result.current(callback)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(500)

    expect(callback).not.toBeCalled()

    result.current(callback)

    jest.advanceTimersByTime(500)

    expect(callback).not.toBeCalled()

    jest.advanceTimersByTime(500)

    expect(callback).toBeCalledTimes(1)
  })
})
