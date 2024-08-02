import { wait } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react'
import { useRequestMemo } from './useRequestMemo'

const delay = 120

describe('useRequestMemo hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('check memoization by same key', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const request2 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request2'
    }
    const key1 = 'key1'

    expect(result.current.hasRequest(key1)).toBe(false)

    const memoized1 = result.current.memoizedRequest(key1, request1)

    expect(result.current.hasRequest(key1)).toBe(true)

    jest.advanceTimersByTime(delay / 2)
    const memoized2 = result.current.memoizedRequest(key1, request2)

    jest.runAllTimers()
    expect(result.current.hasRequest(key1)).toBe(true)
    expect(await memoized1).toBe('request1')
    expect(await memoized2).toBe('request1')
    expect(result.current.hasRequest(key1)).toBe(false)
    expect(mockRequest1).toBeCalledTimes(1)
  })

  it('check memoization by same key one by one', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const request2 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request2'
    }
    const key1 = 'key1'

    expect(result.current.hasRequest(key1)).toBe(false)

    const answer1 = result.current.memoizedRequest(key1, request1)
    jest.runAllTimers()
    const memoized1 = await answer1
    await Promise.resolve() // wait all hook microtask

    const answer2 = result.current.memoizedRequest(key1, request2)
    jest.runAllTimers()
    const memoized2 = await answer2
    await Promise.resolve() // wait all hook microtask

    expect(memoized1).toBe('request1')
    expect(memoized2).toBe('request2')
    expect(result.current.hasRequest(key1)).toBe(false)
    expect(mockRequest1).toBeCalledTimes(2)
  })

  it('check memoization by different key', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const key1 = 'key1'
    const key2 = 'key2'

    expect(result.current.hasRequest(key1)).toBe(false)
    expect(result.current.hasRequest(key2)).toBe(false)

    const memoized1 = result.current.memoizedRequest(key1, request1)

    expect(result.current.hasRequest(key1)).toBe(true)
    expect(result.current.hasRequest(key2)).toBe(false)

    const memoized2 = result.current.memoizedRequest(key2, request1)

    expect(result.current.hasRequest(key1)).toBe(true)
    expect(result.current.hasRequest(key2)).toBe(true)

    jest.runAllTimers()

    expect(await memoized1).toBe('request1')
    await Promise.resolve() // wait all hook microtask
    expect(result.current.hasRequest(key1)).toBe(false)
    expect(await memoized2).toBe('request1')
    await Promise.resolve() // wait all hook microtask
    expect(result.current.hasRequest(key2)).toBe(false)
    expect(mockRequest1).toBeCalledTimes(2)
  })

  it('check setRequest', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const request2 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request2'
    }
    const key1 = 'key1'

    expect(result.current.hasRequest(key1)).toBe(false)

    const memoized1 = result.current.memoizedRequest(key1, request1)
    expect(result.current.hasRequest(key1)).toBe(true)
    const promise2 = request2()
    jest.advanceTimersByTime(delay / 2)
    expect(result.current.getRequest(key1)).not.toBe(promise2)
    result.current.setRequest(key1, promise2)
    expect(result.current.getRequest(key1)).toBe(promise2)
    const memoized2 = result.current.memoizedRequest(key1, request1)

    jest.runAllTimers()
    expect(await memoized1).toBe('request1')
    expect(await memoized2).toBe('request2')
    expect(result.current.hasRequest(key1)).toBe(false)
    expect(mockRequest1).toBeCalledTimes(2)
  })

  it('check deleteRequest', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const request2 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request2'
    }
    const key1 = 'key1'

    expect(result.current.hasRequest(key1)).toBe(false)

    const memoized1 = result.current.memoizedRequest(key1, request1)

    expect(result.current.hasRequest(key1)).toBe(true)

    jest.advanceTimersByTime(delay / 3)
    expect(result.current.hasRequest(key1)).toBe(true)
    result.current.deleteRequest(key1)
    expect(result.current.hasRequest(key1)).toBe(false)

    const memoized2 = result.current.memoizedRequest(key1, request2)

    expect(result.current.hasRequest(key1)).toBe(true)

    jest.advanceTimersByTime(delay / 3)
    expect(result.current.hasRequest(key1)).toBe(true)
    result.current.deleteRequest(key1)
    expect(result.current.hasRequest(key1)).toBe(false)

    const memoized3 = result.current.memoizedRequest(key1, request1)

    jest.runAllTimers()
    expect(await memoized1).toBe('request1')
    expect(await memoized2).toBe('request2')
    expect(await memoized3).toBe('request1')
    expect(result.current.hasRequest(key1)).toBe(false)
    expect(mockRequest1).toBeCalledTimes(3)
  })
  it('check hasRequest and getRequest', async () => {
    const { result } = renderHook(() => useRequestMemo())
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request1'
    }
    const request2 = async () => {
      await wait(delay)
      mockRequest1()
      return 'request2'
    }
    const key1 = 'key1'
    const key2 = 'key2'

    const promise1 = request1()
    const promise2 = request2()

    expect(result.current.hasRequest(key1)).toBe(false)
    expect(result.current.hasRequest(key2)).toBe(false)
    expect(result.current.getRequest(key1)).toBe(undefined)
    expect(result.current.getRequest(key2)).toBe(undefined)

    result.current.setRequest(key1, promise1)

    expect(result.current.hasRequest(key1)).toBe(true)
    expect(result.current.hasRequest(key2)).toBe(false)
    expect(result.current.getRequest(key1)).toBe(promise1)
    expect(result.current.getRequest(key2)).toBe(undefined)

    result.current.setRequest(key1, promise2)

    expect(result.current.hasRequest(key1)).toBe(true)
    expect(result.current.hasRequest(key2)).toBe(false)
    expect(result.current.getRequest(key1)).toBe(promise2)
    expect(result.current.getRequest(key2)).toBe(undefined)

    result.current.setRequest(key2, promise2)

    expect(result.current.hasRequest(key1)).toBe(true)
    expect(result.current.hasRequest(key2)).toBe(true)
    expect(result.current.getRequest(key1)).toBe(promise2)
    expect(result.current.getRequest(key2)).toBe(promise2)

    result.current.deleteRequest(key1)

    expect(result.current.hasRequest(key1)).toBe(false)
    expect(result.current.hasRequest(key2)).toBe(true)
    expect(result.current.getRequest(key1)).toBe(undefined)
    expect(result.current.getRequest(key2)).toBe(promise2)

    result.current.deleteRequest(key1)

    expect(result.current.hasRequest(key1)).toBe(false)
    expect(result.current.hasRequest(key2)).toBe(true)
    expect(result.current.getRequest(key1)).toBe(undefined)
    expect(result.current.getRequest(key2)).toBe(promise2)

    result.current.deleteRequest(key2)

    expect(result.current.hasRequest(key1)).toBe(false)
    expect(result.current.hasRequest(key2)).toBe(false)
    expect(result.current.getRequest(key1)).toBe(undefined)
    expect(result.current.getRequest(key2)).toBe(undefined)
  })
})
