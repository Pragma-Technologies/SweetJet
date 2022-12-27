import { wait } from '@pragma-web-utils/core'
import { renderHook } from '@testing-library/react-hooks'
import { CANCEL_PROMISE } from '../constants'
import { useCancelableFactory } from './useCancelableFactory'

const makePromise = async (value: unknown, delay = 100) => {
  await wait(delay)
  return value
}

describe('useCancelableFactory hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('check createCancelableFactory.makeCancellable', async () => {
    const { result } = renderHook(() => useCancelableFactory())

    const onCancel = jest.fn()
    const { makeCancellable, cancel } = result.current(onCancel)
    const cancelable1 = makeCancellable(makePromise('value1'))
    const cancelable2 = makeCancellable(makePromise('value2'))

    jest.runAllTimers()

    expect(await cancelable1).toBe('value1')
    expect(await cancelable2).toBe('value2')
    expect(onCancel).not.toBeCalled()

    const cancelable3 = makeCancellable(makePromise('value3'))
    const cancelable4 = makeCancellable(makePromise('value4', 200))
    const cancelable5 = makeCancellable(makePromise('value5', 200))

    jest.advanceTimersByTime(100)
    await cancelable3
    cancel()

    jest.runAllTimers()

    await expect(cancelable3).resolves.toBe('value3')
    await expect(cancelable4).rejects.toBe(CANCEL_PROMISE)
    await expect(cancelable5).rejects.toBe(CANCEL_PROMISE)
    expect(onCancel).toBeCalledTimes(1)
  })

  it('check createCancelableFactory.makeUnmountable', async () => {
    const { result } = renderHook(() => useCancelableFactory())

    const onCancel = jest.fn()
    const { makeUnmountable, cancel } = result.current(onCancel)
    const unmountable1 = makeUnmountable(makePromise('value1'))
    const unmountable2 = makeUnmountable(makePromise('value2'))

    jest.runAllTimers()
    expect(await unmountable1).toBe('value1')
    expect(await unmountable2).toBe('value2')
    expect(onCancel).not.toBeCalled()

    const unmountable3 = makeUnmountable(makePromise('value3'))
    const unmountable4 = makeUnmountable(makePromise('value4', 200))
    const unmountable5 = makeUnmountable(makePromise('value5', 200))

    jest.advanceTimersByTime(100)
    await unmountable3
    cancel()

    jest.runAllTimers()

    expect(await unmountable3).toBe('value3')
    expect(await unmountable4).toBe('value4')
    expect(await unmountable5).toBe('value5')
    expect(onCancel).toBeCalledTimes(1)
  })
  it('check createCancelableFactory on unmount', async () => {
    const { result, unmount } = renderHook(() => useCancelableFactory())

    const onCancel = jest.fn()
    const { makeUnmountable, makeCancellable } = result.current(onCancel)
    const cancelable1 = makeCancellable(makePromise('value1'))
    const unmountable1 = makeUnmountable(makePromise('value2'))

    unmount()
    jest.runAllTimers()

    expect(cancelable1).rejects.toBe(CANCEL_PROMISE)
    expect(unmountable1).rejects.toBe(CANCEL_PROMISE)
    expect(onCancel).toBeCalledTimes(0)
  })
})
