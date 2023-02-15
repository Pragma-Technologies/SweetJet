import { wait } from '@pragma-web-utils/core'
import { act, renderHook } from '@testing-library/react-hooks'
import { useEffect } from 'react'
import { TestIncrementor } from '../testUtils'
import { HookCommonState } from '../types'
import { useCombineCommonStates } from './useCombineCommonStates'
import { useCommonState } from './useCommonState'
import { useMapCommonState } from './useMapCommonState'

type CommonStateTestUtil<T = unknown, E = unknown> = {
  utilName: string
  initHook: () => HookCommonState<T, E>
  throwErrorOnNextUpdateOnce: () => void
  expectedInitValue: T
  expectedValues: [T, T]
  expectedError: E
  expectedValueOnError: T
  expectedCacheOnError: T
  reset: () => Promise<void>
}

const testIncrementor = new TestIncrementor()
const testIncrementor2 = new TestIncrementor()

describe.each<CommonStateTestUtil>([
  {
    utilName: 'useCommonState',
    reset: async () => {
      testIncrementor.refresh()
    },
    expectedInitValue: undefined,
    expectedValues: [0, 1],
    expectedError: 'error',
    expectedValueOnError: undefined,
    expectedCacheOnError: 0,
    initHook: () => {
      const { state, setRefresh } = useCommonState<number>()

      useEffect(() => setRefresh({ refreshFn: () => testIncrementor.increment() }), [])

      return state
    },
    throwErrorOnNextUpdateOnce: () => {
      testIncrementor.setErrorOnNextIncrementInit('error')
    },
  },
  {
    utilName: 'useMapCommonState',
    reset: async () => {
      testIncrementor.refresh()
    },
    expectedInitValue: undefined,
    expectedValues: [1, 3],
    expectedError: 'error',
    expectedValueOnError: undefined,
    expectedCacheOnError: 1,
    initHook: () => {
      const { state, setRefresh } = useCommonState<number>()

      useEffect(() => setRefresh({ refreshFn: () => testIncrementor.increment() }), [])

      return useMapCommonState(state, (value) => {
        if (value === undefined) {
          return undefined
        }
        return 2 * value + 1
      })
    },
    throwErrorOnNextUpdateOnce: () => {
      testIncrementor.setErrorOnNextIncrementInit('error')
    },
  },
  {
    utilName: 'useCombineCommonStates',
    reset: async () => {
      testIncrementor.refresh()
      testIncrementor2.refresh()
      await testIncrementor2.increment()
    },
    expectedInitValue: [undefined, undefined],
    expectedValues: [
      [0, 1],
      [1, 2],
    ],
    expectedError: { error: [undefined, 'error'] },
    expectedValueOnError: [1, undefined],
    expectedCacheOnError: [1, 1],
    initHook: () => {
      const { state: state1, setRefresh: setRefresh1 } = useCommonState<number>()
      const { state: state2, setRefresh: setRefresh2 } = useCommonState<number>()

      useEffect(() => setRefresh1({ refreshFn: () => testIncrementor.increment() }), [])
      useEffect(() => setRefresh2({ refreshFn: () => testIncrementor2.increment() }), [])

      return useCombineCommonStates(state1, state2)
    },
    throwErrorOnNextUpdateOnce: () => {
      testIncrementor2.setErrorOnNextIncrementInit('error')
    },
  },
  {
    utilName: 'useCombineCommonStates + useMapCommonState',
    reset: async () => {
      testIncrementor.refresh()
      testIncrementor2.refresh()
      await testIncrementor2.increment()
    },
    expectedInitValue: undefined,
    expectedValues: [1, 3],
    expectedError: { error: [undefined, 'error'] },
    expectedValueOnError: undefined,
    expectedCacheOnError: 2,
    initHook: () => {
      const { state: state1, setRefresh: setRefresh1 } = useCommonState<number>()
      const { state: state2, setRefresh: setRefresh2 } = useCommonState<number>()

      useEffect(() => setRefresh1({ refreshFn: () => testIncrementor.increment() }), [])
      useEffect(() => setRefresh2({ refreshFn: () => testIncrementor2.increment() }), [])

      const combine = useCombineCommonStates(state1, state2)

      return useMapCommonState(combine, ([first, second]) => {
        if (first === undefined || second === undefined) {
          return undefined
        }
        return first + second
      })
    },
    throwErrorOnNextUpdateOnce: () => {
      testIncrementor2.setErrorOnNextIncrementInit('error')
    },
  },
])(
  'HookCommonState interface implementations',
  ({
    utilName,
    reset,
    initHook,
    expectedError,
    expectedInitValue,
    expectedValues,
    throwErrorOnNextUpdateOnce,
    expectedValueOnError,
    expectedCacheOnError,
  }) => {
    // reset counter value before each test case
    beforeEach(async () => await reset())

    it(`${utilName}: check softRefresh`, async () => {
      const { result, waitForNextUpdate } = renderHook(() => initHook())

      expect(result.current.value).toEqual(expectedInitValue)
      expect(result.current.cached).toEqual(expectedInitValue)
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)

      act(() => {
        result.current.softRefresh()
      })

      expect(result.current.value).toEqual(expectedInitValue)
      expect(result.current.cached).toEqual(expectedInitValue)
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)

      act(() => {
        result.current.softRefresh()
      })

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await wait(10)

      act(() => {
        result.current.softRefresh()
      })

      await wait(10)

      act(() => {
        result.current.softRefresh()
      })

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValues[1])
      expect(result.current.cached).toEqual(expectedValues[1])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)
    })

    it(`${utilName}: check hardRefresh`, async () => {
      const { result, waitForNextUpdate } = renderHook(() => initHook())

      expect(result.current.value).toEqual(expectedInitValue)
      expect(result.current.cached).toEqual(expectedInitValue)
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)

      act(() => {
        result.current.hardRefresh()
      })

      expect(result.current.value).toEqual(expectedInitValue)
      expect(result.current.cached).toEqual(expectedInitValue)
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)

      act(() => {
        result.current.hardRefresh()
      })

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await wait(10)

      act(() => {
        result.current.hardRefresh()
      })

      await wait(10)

      act(() => {
        result.current.hardRefresh()
      })

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValues[1])
      expect(result.current.cached).toEqual(expectedValues[1])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)
    })

    it(`${utilName}: check onError callback`, async () => {
      const { result, waitForNextUpdate } = renderHook(() => initHook())

      act(() => {
        result.current.softRefresh()
      })

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(undefined)

      throwErrorOnNextUpdateOnce()
      act(() => {
        result.current.softRefresh()
      })

      expect(result.current.value).toEqual(expectedValues[0])
      expect(result.current.cached).toEqual(expectedValues[0])
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(undefined)

      await waitForNextUpdate()

      expect(result.current.value).toEqual(expectedValueOnError)
      expect(result.current.cached).toEqual(expectedCacheOnError)
      expect(result.current.isActual).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toEqual(expectedError)
    })
  },
)
