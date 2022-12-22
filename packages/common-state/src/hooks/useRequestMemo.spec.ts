import { wait } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react-hooks'
import { useRequestMemo } from './useRequestMemo'

jest.useFakeTimers()

const delay = 100

function mockCall(): Promise<string> {
  return new Promise<string>((resolve) => setTimeout(() => resolve('success'), 20))
}

const callReceiver = jest.fn((result: string) => {
  console.log(result)
})

class Caller {
  constructor(call: () => Promise<string>, receiver: (result: string) => void) {
    call().then(receiver)
  }
}

describe('useRequestMemo hook', () => {
  it('advances mock timers correctly', () => {
    new Caller(mockCall, callReceiver)
    jest.advanceTimersByTime(50)
    return Promise.resolve().then(() => {
      expect(callReceiver).toHaveBeenCalled()
    })
  })
  it('test', async () => {
    const mockRequest1 = jest.fn()

    const request1 = async () => {
      console.log('here')
      await new Promise((resolve) => {
        console.log('promise')
        setTimeout(() => {
          console.log('timeout')
          resolve(delay)
        }, delay)
      })
      console.log('wait')
      mockRequest1()
      return 'request1'
    }

    const promise = request1()

    setTimeout(() => {
      expect(mockRequest1).toBeCalledTimes(1)
      console.log('timeout 2')
    }, 1000)

    console.log('jest')
    // jest.runAllTimers()
    jest.advanceTimersByTime(5000)
    await Promise.resolve()
    expect(await promise).toBe('request1')
  })
  it('check memoization by same key', async () => {
    const mockRequest1 = jest.fn()
    const request1 = async () => {
      console.log('here')
      await wait(delay)
      console.log('wait')
      mockRequest1()
      return 'request1'
    }

    const memoized1 = request1()

    jest.runAllTicks()

    expect(await memoized1).toBe('request1')
  })
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
