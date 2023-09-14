import { Destructor } from '@pragma-web-utils/hooks'
import { act, renderHook } from '@testing-library/react-hooks'
import { useEffect } from 'react'
import { TestIncrementor } from '../testUtils'
import { useCombineCommonStates } from './useCombineCommonStates'
import { useCommonState } from './useCommonState'

const testIncrementor = new TestIncrementor()
const testIncrementor2 = new TestIncrementor()

// TODO: add key tests
describe('useCombineCommonStates', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  beforeEach(async () => {
    testIncrementor.refresh()
    testIncrementor2.refresh()
    testIncrementor2.increment()
    jest.runAllTimers()
    await Promise.resolve()
  })

  it('check state updates', async () => {
    const refreshFn1 = jest.fn(() => testIncrementor.increment())
    const refreshFn2 = jest.fn(() => testIncrementor2.increment())
    const { result, waitForNextUpdate } = renderHook(() => {
      const { state: state1, setRefresh: setRefresh1 } = useCommonState<number>()
      const { state: state2, setRefresh: setRefresh2 } = useCommonState<number>()

      useEffect(() => setRefresh1({ refreshFn: refreshFn1 }), [])
      useEffect(() => setRefresh2({ refreshFn: refreshFn2 }), [])

      const combine = useCombineCommonStates(state1, state2)
      return { combine, state1, state2 }
    })

    // init combine result
    expect(result.current.combine.value).toEqual([undefined, undefined])
    expect(result.current.combine.cached).toEqual([undefined, undefined])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // init state1
    expect(result.current.state1.value).toEqual(undefined)
    expect(result.current.state1.cached).toEqual(undefined)
    expect(result.current.state1.isActual).toBe(false)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // init state2
    expect(result.current.state2.value).toEqual(undefined)
    expect(result.current.state2.cached).toEqual(undefined)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      result.current.combine.softRefresh()
    })

    // start loading
    // combine
    expect(result.current.combine.value).toEqual([undefined, undefined])
    expect(result.current.combine.cached).toEqual([undefined, undefined])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(undefined)
    expect(result.current.state1.cached).toEqual(undefined)
    expect(result.current.state1.isActual).toBe(false)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(undefined)
    expect(result.current.state2.cached).toEqual(undefined)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    // first loaded value
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      result.current.state1.softRefresh()
    })

    // update first state separately
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    // result of first state update
    // combine
    expect(result.current.combine.value).toEqual([1, 1])
    expect(result.current.combine.cached).toEqual([1, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(1)
    expect(result.current.state1.cached).toEqual(1)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      result.current.state2.hardRefresh()
    })

    // update second state separately
    // combine
    expect(result.current.combine.value).toEqual([1, 1])
    expect(result.current.combine.cached).toEqual([1, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(1)
    expect(result.current.state1.cached).toEqual(1)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.advanceTimersByTime(50)

    act(() => {
      result.current.state1.softRefresh()
    })

    // update first state separately during update other states
    // combine
    expect(result.current.combine.value).toEqual([1, 1])
    expect(result.current.combine.cached).toEqual([1, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(1)
    expect(result.current.state1.cached).toEqual(1)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.advanceTimersByTime(50)
    await waitForNextUpdate()

    // result of second state update (first state update in progress)
    // combine
    expect(result.current.combine.value).toEqual([1, 2])
    expect(result.current.combine.cached).toEqual([1, 2])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(1)
    expect(result.current.state1.cached).toEqual(1)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(2)
    expect(result.current.state2.cached).toEqual(2)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    // result of first state update
    // combine
    expect(result.current.combine.value).toEqual([2, 2])
    expect(result.current.combine.cached).toEqual([2, 2])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(2)
    expect(result.current.state1.cached).toEqual(2)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(2)
    expect(result.current.state2.cached).toEqual(2)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)
  })

  it('check canceling state updates', async () => {
    const refreshFn1 = jest.fn(() => testIncrementor.increment())
    const refreshFn2 = jest.fn(() => testIncrementor2.increment())
    const { result, waitForNextUpdate } = renderHook(() => {
      const { state: state1, setRefresh: setRefresh1 } = useCommonState<number>()
      const { state: state2, setRefresh: setRefresh2 } = useCommonState<number>()

      useEffect(() => setRefresh1({ refreshFn: refreshFn1 }), [])
      useEffect(() => setRefresh2({ refreshFn: refreshFn2 }), [])

      const combine = useCombineCommonStates(state1, state2)
      return { combine, state1, state2 }
    })

    // init combine result
    expect(result.current.combine.value).toEqual([undefined, undefined])
    expect(result.current.combine.cached).toEqual([undefined, undefined])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // init state1
    expect(result.current.state1.value).toEqual(undefined)
    expect(result.current.state1.cached).toEqual(undefined)
    expect(result.current.state1.isActual).toBe(false)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // init state2
    expect(result.current.state2.value).toEqual(undefined)
    expect(result.current.state2.cached).toEqual(undefined)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      result.current.combine.softRefresh()
    })

    // start loading
    // combine
    expect(result.current.combine.value).toEqual([undefined, undefined])
    expect(result.current.combine.cached).toEqual([undefined, undefined])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(undefined)
    expect(result.current.state1.cached).toEqual(undefined)
    expect(result.current.state1.isActual).toBe(false)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(undefined)
    expect(result.current.state2.cached).toEqual(undefined)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    // first loaded value
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    let cancel: Destructor | void
    act(() => {
      cancel = result.current.combine.softRefresh()
    })

    // start loading
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    act(() => cancel?.())
    jest.runAllTimers()
    await waitForNextUpdate()

    // result after canceling
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      cancel = result.current.state1.softRefresh()
    })

    // update first state separately
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => cancel?.())
    jest.runAllTimers()
    await waitForNextUpdate()

    // result of first state update after canceling
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(true)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(true)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    act(() => {
      cancel = result.current.state2.hardRefresh()
    })

    // update second state separately
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.advanceTimersByTime(50)

    act(() => cancel?.())
    act(() => {
      result.current.state1.softRefresh()
    })

    // update first state separately during update other states
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(true)
    expect(result.current.state2.error).toBe(undefined)

    jest.advanceTimersByTime(50)
    await waitForNextUpdate()

    // result of second state update after canceling (first state update in progress)
    // combine
    expect(result.current.combine.value).toEqual([0, 1])
    expect(result.current.combine.cached).toEqual([0, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(true)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(0)
    expect(result.current.state1.cached).toEqual(0)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(true)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)

    jest.runAllTimers()
    await waitForNextUpdate()

    // result of first state update
    // combine
    expect(result.current.combine.value).toEqual([3, 1])
    expect(result.current.combine.cached).toEqual([3, 1])
    expect(result.current.combine.isActual).toBe(false)
    expect(result.current.combine.isLoading).toBe(false)
    expect(result.current.combine.error).toBe(undefined)
    // state1
    expect(result.current.state1.value).toEqual(3)
    expect(result.current.state1.cached).toEqual(3)
    expect(result.current.state1.isActual).toBe(true)
    expect(result.current.state1.isLoading).toBe(false)
    expect(result.current.state1.error).toBe(undefined)
    // state2
    expect(result.current.state2.value).toEqual(1)
    expect(result.current.state2.cached).toEqual(1)
    expect(result.current.state2.isActual).toBe(false)
    expect(result.current.state2.isLoading).toBe(false)
    expect(result.current.state2.error).toBe(undefined)
  })
})
