import { wait } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { CancellablePromise } from '../types'
import { useCancelablePool } from './useCancelablePool'

const makePromise = async (value: unknown, delay = 100) => {
  await wait(delay)
  return value
}

let pool: Record<string, CancellablePromise[]> = {}

describe('useCancelablePool hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  beforeEach(() => {
    pool = {}
    jest.spyOn(React, 'useRef').mockImplementation(() => ({ current: pool }))
  })

  it('check useCancelablePool.addToCancelablePool', async () => {
    const { result } = renderHook(() => useCancelablePool())

    const key1 = 'key1'
    const key2 = 'key2'
    const cancel = jest.fn()
    const promise1 = makePromise('value1')
    const promise2 = makePromise('value2')
    const promise3 = makePromise('value3', 50)

    expect(pool[key1]).not.toBeDefined()

    result.current.addToCancelablePool(key1, { cancellablePromise: promise1, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(1)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)

    result.current.addToCancelablePool(key1, { cancellablePromise: promise2, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).not.toBeDefined()

    result.current.addToCancelablePool(key2, { cancellablePromise: promise3, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).toBeDefined()
    expect(pool[key2].length).toBe(1)
    expect(pool[key2][0].cancellablePromise).toBe(promise3)

    jest.advanceTimersByTime(50)
    await Promise.resolve()
    await Promise.resolve() // wait all hook microtask

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).toBeDefined()
    expect(pool[key2].length).toBe(0)

    jest.runAllTimers()
    await Promise.resolve()
    await Promise.resolve() // wait all hook microtask

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(0)
    expect(pool[key2]).toBeDefined()
    expect(pool[key2].length).toBe(0)

    expect(cancel).not.toBeCalled()
  })

  it('check useCancelablePool.addToCancelablePool', async () => {
    const { result } = renderHook(() => useCancelablePool())

    const key1 = 'key1'
    const key2 = 'key2'
    const cancel = jest.fn()
    const promise1 = makePromise('value1')
    const promise2 = makePromise('value2')
    const promise3 = makePromise('value3', 50)

    expect(pool[key1]).not.toBeDefined()

    result.current.addToCancelablePool(key1, { cancellablePromise: promise1, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(1)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)

    result.current.addToCancelablePool(key1, { cancellablePromise: promise2, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).not.toBeDefined()

    result.current.addToCancelablePool(key2, { cancellablePromise: promise3, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).toBeDefined()
    expect(pool[key2].length).toBe(1)
    expect(pool[key2][0].cancellablePromise).toBe(promise3)

    expect(cancel).not.toBeCalled()

    result.current.clearCancelablePool(key1)

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).not.toBeDefined()

    expect(cancel).toBeCalledTimes(1)

    result.current.addToCancelablePool(key2, { cancellablePromise: promise3, cancel })

    expect(pool[key1]).toBeDefined()
    expect(pool[key1].length).toBe(2)
    expect(pool[key1][0].cancellablePromise).toBe(promise1)
    expect(pool[key1][1].cancellablePromise).toBe(promise2)

    expect(pool[key2]).toBeDefined()
    expect(pool[key2].length).toBe(1)
    expect(pool[key2][0].cancellablePromise).toBe(promise3)

    expect(cancel).toBeCalledTimes(1)

    result.current.clearCancelablePool()

    expect(pool[key1]).not.toBeDefined()
    expect(pool[key2]).not.toBeDefined()

    expect(cancel).toBeCalledTimes(4)
  })
})
