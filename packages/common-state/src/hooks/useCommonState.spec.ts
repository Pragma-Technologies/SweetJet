import { act, renderHook } from '@testing-library/react-hooks'
import { TestIncrementor } from '../testUtils'
import { useCommonState } from './useCommonState'

const testIncrementor = new TestIncrementor()

describe('useCommonState hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  beforeEach(() => testIncrementor.refresh())

  it('check setRefresh', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn: () => testIncrementor.increment() })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check initial value', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>(-1))

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn: () => testIncrementor.increment() })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check initial function', async () => {
    const initialFn = jest.fn(() => -1)
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>(() => initialFn()))

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn: () => testIncrementor.increment() })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(-1)
    expect(result.current.state.cached).toBe(-1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    expect(initialFn).toBeCalledTimes(1)
  })

  it('check setState', async () => {
    const { result } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState({
        value: 1,
        cached: 1,
        isActual: true,
        isLoading: false,
        error: undefined,
      })
    })

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState((prev) => ({ ...prev, value: 2 }))
    })

    expect(result.current.state.value).toBe(2)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState((prev) => ({ ...prev, value: 3 }))
      result.current.setState((prev) => ({ ...prev, value: 4 }))
    })

    expect(result.current.state.value).toBe(4)
    expect(result.current.state.cached).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check onError callback', async () => {
    const mockErrorRequest = jest.fn()
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    result.current.setRefresh({ refreshFn: () => testIncrementor.increment() })
    act(() => {
      result.current.state.softRefresh()
    })

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({
      refreshFn: async () => {
        throw 'error'
      },
      onError: mockErrorRequest,
    })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(mockErrorRequest).toBeCalledTimes(0)

    jest.runAllTimers()
    await waitForNextUpdate()

    expect(mockErrorRequest).toBeCalledTimes(1)
    expect(mockErrorRequest).toHaveBeenCalledWith('error', {
      isActual: true,
      isLoading: false,
      cached: 0,
      value: undefined,
      error: 'error',
    })
  })
})
