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
    const { result, waitForNextUpdate, rerender } = renderHook(
      ([switchKey]) => {
        const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
        const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
          originState,
        )

        useEffect(() => setOriginRefresh({ refreshFn: () => testIncrementor.increment(), requestKey: 'originKey' }), [])
        useEffect(
          () =>
            setSwitchRefresh({
              refreshFn: async (origin) => origin + (await testIncrementor2.increment()),
              requestKey: (origin) => `${origin}_${switchKey}`,
            }),
          [switchKey],
        )
        useEffect(() => {
          testIncrementor.setValue(2)
          setOriginState((prev) => ({ ...prev, isActual: true }))
        }, [])

        return { originState, switchState }
      },
      { initialProps: ['key'] },
    )

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

    // wait finishing init request
    await Promise.resolve()
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(1)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(1)
    expect(result.current.originState.key).toBe('')

    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(1)
    expect(result.current.switchState.key).toBe('1_key')

    act(() => {
      result.current.originState.softRefresh()
    })

    // wait finishing origin refresh
    await Promise.resolve()
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(1)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(true)
    expect(result.current.switchState.isActual).toBe(false)
    expect(result.current.switchState.cached).toBe(1)
    expect(result.current.switchState.key).toBe('1_key')

    // wait finishing switch refresh
    await Promise.resolve()
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(3)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(3)
    expect(result.current.switchState.key).toBe('2_key')

    act(() => {
      result.current.switchState.softRefresh()
    })

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(3)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(true)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(3)
    expect(result.current.switchState.key).toBe('2_key')

    // wait finishing switch refresh
    await Promise.resolve()
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(4)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(4)
    expect(result.current.switchState.key).toBe('2_key')

    rerender(['altKey'])
    act(() => {
      result.current.switchState.softRefresh()
    })

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(4)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(true)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(4)
    expect(result.current.switchState.key).toBe('2_key')

    // wait finishing switch refresh
    await Promise.resolve()
    jest.runAllTimers()
    await waitForNextUpdate()

    expect(result.current.originState.value).toBe(2)
    expect(result.current.originState.error).toBe(undefined)
    expect(result.current.originState.isLoading).toBe(false)
    expect(result.current.originState.isActual).toBe(true)
    expect(result.current.originState.cached).toBe(2)
    expect(result.current.originState.key).toBe('originKey')

    expect(result.current.switchState.value).toBe(5)
    expect(result.current.switchState.error).toBe(undefined)
    expect(result.current.switchState.isLoading).toBe(false)
    expect(result.current.switchState.isActual).toBe(true)
    expect(result.current.switchState.cached).toBe(5)
    expect(result.current.switchState.key).toBe('2_altKey')
  })

  it('check refreshing origin without refresh on origin changes', async () => {
    const { result, waitForNextUpdate } = renderHook(() => {
      const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
      const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
        originState,
        { withRefreshOnOriginUpdate: false },
      )

      useEffect(() => setOriginRefresh({ refreshFn: () => testIncrementor.increment() }), [])
      useEffect(
        () => setSwitchRefresh({ refreshFn: async (origin) => origin + (await testIncrementor2.increment()) }),
        [],
      )
      useEffect(() => {
        testIncrementor.setValue(2)
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
    await Promise.resolve()
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
      const { state: originState, setRefresh: setOriginRefresh, setState: setOriginState } = useCommonState<number>(1)
      const { state: switchState, setRefresh: setSwitchRefresh } = useSwitchCommonState<typeof originState, number>(
        originState,
      )

      useEffect(() => setOriginRefresh({ refreshFn: mockOriginRefresh }), [])
      useEffect(() => setSwitchRefresh({ refreshFn: mockSwitchRefresh }), [])
      useEffect(() => {
        testIncrementor.setValue(2)
        setOriginState((prev) => ({ ...prev, isActual: true }))
      }, [])

      return { originState, switchState }
    })

    // wrap check initial checks, because useSwitchCommonState has refreshing on init
    await act(async () => {
      expect(mockOriginRefresh).toBeCalledTimes(0)
      expect(result.current.originState.value).toBe(1)
      expect(result.current.originState.error).toBe(undefined)
      expect(result.current.originState.isLoading).toBe(false)
      expect(result.current.originState.isActual).toBe(true)
      expect(result.current.originState.cached).toBe(1)

      await Promise.resolve()
      expect(mockSwitchRefresh).toBeCalledTimes(1)
      expect(result.current.switchState.value).toBe(undefined)
      expect(result.current.switchState.error).toBe(undefined)
      expect(result.current.switchState.isLoading).toBe(true)
      expect(result.current.switchState.isActual).toBe(false)
      expect(result.current.switchState.cached).toBe(undefined)
    })

    // wait finishing init request
    await Promise.resolve()
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

    await Promise.resolve()
    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(mockSwitchRefresh).toBeCalledTimes(1)

    jest.advanceTimersByTime(10)

    act(() => {
      result.current.originState.softRefresh()
    })

    expect(mockOriginRefresh).toBeCalledTimes(1)
    expect(mockSwitchRefresh).toBeCalledTimes(1)

    // wait finishing origin refresh
    await Promise.resolve()
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
    await Promise.resolve()
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
