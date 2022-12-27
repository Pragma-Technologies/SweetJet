import { wait } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react-hooks'
import { useRequestMemo } from './useRequestMemo'

const delay = 100

describe('useRequestMemo hook', () => {
  it('check memoization by same key', async () => {
    const { result, unmount, rerender } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      console.log('here')
      await wait(delay)
      console.log('wait')
      mockRequest1()
      return 'request1'
    }
    const key1 = 'key1'

    const memoized1 = result.current.memoizedRequest(key1, request1)
    const memoized2 = result.current.memoizedRequest(key1, request1)

    jest.advanceTimersByTime(delay)

    expect(await memoized1).toBe('request1')
    expect(await memoized2).toBe('request1')
  })
})
