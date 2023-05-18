import { act, renderHook } from '@testing-library/react-hooks'
import { useEffect } from 'react'
import { TestIncrementor } from '../testUtils'
import { useCommonState } from './useCommonState'
import { useSwitchCommonState } from './useSwitchCommonState'

const testIncrementor = new TestIncrementor()
const testIncrementor2 = new TestIncrementor()

describe('useSwitchCommonState', () => {
  beforeEach(async () => {
    jest.useFakeTimers()
    testIncrementor.refresh()
    testIncrementor2.refresh()
    jest.runAllTimers()
    await Promise.resolve()
  })

  it('check refreshing origin with default settings', async () => {
    const { result, waitForNextUpdate } = renderHook(() => {
      useEffect(() => setOriginRefresh({ refreshFn: () => testIncrementor.increment() }), [])
      useEffect(
        () => setSwitchRefresh({ refreshFn: async (origin) => origin + (await testIncrementor2.increment()) }),
        [],
      )

      testIncrementor.setValue(2)
      const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
      const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
        originState,
      )

      useEffect(() => {
        setOriginState((prev) => ({ ...prev, isActual: true }))
      }, [])

      return { originState, switchState }
    })

    // wrap check initial checks, because useSwitchCommonState has refreshing on init
    act(() => {
      expect(result.current.originState.value).toBe(1)
      expect(result.current.originState.error).toBe(undefined)
      expect(result.current.originState.isLoading).toBe(false)
      expect(result.current.originState.isActual).toBe(true)
      expect(result.current.originState.cached).toBe(1)

      expect(result.current.switchState.value).toBe(undefined)
      expect(result.current.switchState.error).toBe(undefined)
      expect(result.current.switchState.isLoading).toBe(true)
      expect(result.current.switchState.isActual).toBe(false)
      expect(result.current.switchState.cached).toBe(undefined)
    })

    // wait finishing init request
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(1)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(1)

    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(1)

    act(() => {
      result.current.originState.softRefresh()
    })

    // wait finishing origin refresh
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)

    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(true)
    expect(result.current.switchState.isActual).toBe(false)
    expect(result.current.switchState.cached).toBe(1)

    // wait finishing switch refresh
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)

    expect(result.current.switchState.value).toBe(3)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(3)
  })

  it('check refreshing origin without refresh on origin changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => {
      useEffect(() => setOriginRefresh({ refreshFn: () => testIncrementor.increment() }), [])
      useEffect(
        () => setSwitchRefresh({ refreshFn: async (origin) => origin + (await testIncrementor2.increment()) }),
        [],
      )

      testIncrementor.setValue(2)
      const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
      const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
        originState,
        { withRefreshOriginUpdate: false },
      )

      useEffect(() => {
        setOriginState((prev) => ({ ...prev, isActual: true }))
      }, [])

      return { originState, switchState }
    })

    // initial checks
    expect(result.current.originState.value).toBe(1)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(1)

    expect(result.current.switchState.value).toBe(undefined)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(false)
    expect(result.current.switchState.cached).toBe(undefined)

    act(() => {
      result.current.originState.softRefresh()
    })

    // wait finishing refresh
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)

    expect(result.current.switchState.value).toBe(undefined)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(false)
    expect(result.current.switchState.cached).toBe(undefined)
  })

  it('check refreshing switch when origin loading with default settings', async () => {
    const mockOriginRefresh = jest.fn(() => testIncrementor.increment())
    const mockSwitchRefresh = jest.fn(async (origin) => origin + (await testIncrementor2.increment()))

    const { result, waitForNextUpdate } = renderHook(() => {
      useEffect(() => setOriginRefresh({ refreshFn: mockOriginRefresh }), [])
      useEffect(() => setSwitchRefresh({ refreshFn: mockSwitchRefresh }), [])

      testIncrementor.setValue(2)
      const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
      const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
        originState,
      )

      useEffect(() => {
        setOriginState((prev) => ({ ...prev, isActual: true }))
      }, [])

      return { originState, switchState }
    })

    // wrap check initial checks, because useSwitchCommonState has refreshing on init
    act(() => {
      expect(mockOriginRefresh).toBeCalledTimes(0)
      expect(result.current.originState.value).toBe(1)
      expect(result.current.originState.error).toBe(undefined)
      expect(result.current.originState.isLoading).toBe(false)
      expect(result.current.originState.isActual).toBe(true)
      expect(result.current.originState.cached).toBe(1)

      expect(mockSwitchRefresh).toBeCalledTimes(1)
      expect(result.current.switchState.value).toBe(undefined)
      expect(result.current.switchState.error).toBe(undefined)
      expect(result.current.switchState.isLoading).toBe(true)
      expect(result.current.switchState.isActual).toBe(false)
      expect(result.current.switchState.cached).toBe(undefined)
    })

    // wait finishing init request
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(1)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(1)

    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(1)

    expect(mockOriginRefresh).toBeCalledTimes(0)
    expect(mockSwitchRefresh).toBeCalledTimes(1)

    act(() => {
      result.current.originState.softRefresh()
    })

    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(mockSwitchRefresh).toBeCalledTimes(1)

    jest.advanceTimersByTime(10)

    act(() => {
      result.current.originState.softRefresh()
    })

    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(mockSwitchRefresh).toBeCalledTimes(1)

    // wait finishing origin refresh
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)

    expect(mockSwitchRefresh).toBeCalledTimes(2)
    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(true)
    expect(result.current.switchState.isActual).toBe(false)
    expect(result.current.switchState.cached).toBe(1)

    // wait finishing switch refresh
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)

    expect(mockSwitchRefresh).toBeCalledTimes(2)
    expect(result.current.switchState.value).toBe(3)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(3)
  })
})
