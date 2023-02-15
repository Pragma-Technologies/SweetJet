import { Deps } from '@pragma-web-utils/hooks'
import { act, renderHook } from '@testing-library/react-hooks'
import { useEffect } from 'react'
import { TestIncrementor } from '../testUtils'
import { useCommonState } from './useCommonState'
import { useMapCommonState } from './useMapCommonState'

const testIncrementor = new TestIncrementor()

describe('useMapCommonState', () => {
  beforeEach(() => testIncrementor.refresh())

  it(' check deps usage', async () => {
    const mapper = jest.fn((value: number | undefined): number | undefined => {
      if (value === undefined) {
        return undefined
      }
      return 2 * value + 1
    })

    const { result, waitForNextUpdate, rerender } = renderHook(
      (deps: Deps) => {
        const { state, setRefresh } = useCommonState<number>()

        useEffect(() => setRefresh({ refreshFn: () => testIncrementor.increment() }), [])

        return useMapCommonState(state, mapper, [deps])
      },
      { initialProps: [1] },
    )

    expect(mapper).toBeCalledTimes(2)
    expect(result.current.value).toBe(undefined)
    expect(result.current.cached).toBe(undefined)

    act(() => {
      result.current.softRefresh()
    })

    // loading started
    expect(mapper).toBeCalledTimes(4)
    expect(result.current.value).toBe(undefined)
    expect(result.current.cached).toBe(undefined)

    await waitForNextUpdate()

    // loading finished
    expect(mapper).toBeCalledTimes(6)
    expect(result.current.value).toBe(1)
    expect(result.current.cached).toBe(1)

    rerender([2])

    expect(mapper).toBeCalledTimes(8)
    expect(result.current.value).toBe(1)
    expect(result.current.cached).toBe(1)
  })
})
