import { RequestDelayUtils } from './RequestDelayUtils'

jest.useFakeTimers()

type PromiseState = 'pending' | 'fulfilled' | 'rejected'
const promiseState = async (promise: Promise<unknown>): Promise<PromiseState> => {
  try {
    const checkValue = {}
    const fastest = await Promise.race([promise, checkValue])
    return fastest === checkValue ? 'pending' : 'fulfilled'
  } catch (e) {
    return 'rejected'
  }
}

const getPromiseWithDelay = async (value: string) => {
  await RequestDelayUtils.addDelay()
  return value
}

describe('RequestDelayUtils class', () => {
  it('check delay', async () => {
    const promise1 = getPromiseWithDelay('success')
    const promise2 = getPromiseWithDelay('success')
    const promise3 = getPromiseWithDelay('success')
    const promise4 = getPromiseWithDelay('success')

    expect(promiseState(promise1)).resolves.toBe('pending')
    expect(promiseState(promise2)).resolves.toBe('pending')
    expect(promiseState(promise3)).resolves.toBe('pending')
    expect(promiseState(promise4)).resolves.toBe('pending')

    jest.advanceTimersByTime(RequestDelayUtils.getDefaultDelay() - 10)

    // I don't know how and why, but it works. It resolves all unresolved promises
    await Promise.resolve()

    expect(promiseState(promise1)).resolves.toBe('fulfilled')
    expect(promiseState(promise2)).resolves.toBe('fulfilled')
    expect(promiseState(promise3)).resolves.toBe('fulfilled')
    expect(promiseState(promise4)).resolves.toBe('pending')

    jest.advanceTimersByTime(10)

    // but here we need two single resolvers. Awesome experience
    await Promise.resolve()
    await Promise.resolve()

    expect(promiseState(promise4)).resolves.toBe('fulfilled')
  })

  it('check getters and setters', () => {
    RequestDelayUtils.setDefaultDelay(2000)
    expect(RequestDelayUtils.getDefaultDelay()).toBe(2000)
    RequestDelayUtils.setDefaultDelay(500)
    expect(RequestDelayUtils.getDefaultDelay()).toBe(500)
    RequestDelayUtils.setMaxRequestCount(2)
    expect(RequestDelayUtils.getMaxRequestCount()).toBe(2)
    RequestDelayUtils.setMaxRequestCount(5)
    expect(RequestDelayUtils.getMaxRequestCount()).toBe(5)
  })
})
