import { wait } from '@pragma-web-utils/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { useCommonState } from './useCommonState'

describe('useCommonState hook', () => {
  let value = 0
  const error = 'Cath error'
  const incrementCounter = () => value++
  const resetCounter = () => (value = 0)
  const refreshFn = async () => {
    await wait(100)
    return incrementCounter()
  }
  const onError = () => console.error('Error', error)

  // reset counter value before each test case
  beforeEach(resetCounter)

  it('check setRefresh', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check setState', async () => {
    const { result } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState({
        value: 1,
        isActual: true,
        isLoading: false,
        error: undefined,
      })
    })

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState((prev) => ({ ...prev, value: 2 }))
    })

    expect(result.current.state.value).toBe(2)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.setState((prev) => ({ ...prev, value: 3 }))
      result.current.setState((prev) => ({ ...prev, value: 4 }))
    })

    expect(result.current.state.value).toBe(4)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check softRefresh', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await wait(10)

    act(() => {
      result.current.state.softRefresh()
    })

    await wait(10)

    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check hardRefresh', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn })
    act(() => {
      result.current.state.hardRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    act(() => {
      result.current.state.hardRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await wait(10)

    act(() => {
      result.current.state.hardRefresh()
    })

    await wait(10)

    act(() => {
      result.current.state.hardRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(1)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)
  })

  it('check error', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

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
    })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe('error')
  })

  it('check onError', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCommonState<number>())

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe(undefined)

    result.current.setRefresh({ refreshFn })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(undefined)
    expect(result.current.state.isActual).toBe(false)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

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
      onError,
    })
    act(() => {
      result.current.state.softRefresh()
    })

    expect(result.current.state.value).toBe(0)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(true)
    expect(result.current.state.error).toBe(undefined)

    await waitForNextUpdate()

    expect(result.current.state.value).toBe(undefined)
    expect(result.current.state.cached).toBe(0)
    expect(result.current.state.isActual).toBe(true)
    expect(result.current.state.isLoading).toBe(false)
    expect(result.current.state.error).toBe('error')
  })
})
