import { ObservableSubject } from './ObservableSubject'

describe('ObservableSubject class', () => {
  it('check subscription', () => {
    const valueListener = jest.fn()
    const errorListener = jest.fn()
    const subject = new ObservableSubject()

    const key = 'testKey'
    const listener = subject.listen(key, { next: valueListener, error: errorListener })

    const testValue1 = 'testValue1'
    subject.sendValue('testKey', testValue1)

    expect(valueListener).toBeCalledTimes(1)
    expect(valueListener).toBeCalledWith(testValue1)
    expect(errorListener).toBeCalledTimes(0)

    const testValue2 = 'testValue2'
    subject.sendValue(key, testValue2)

    expect(valueListener).toBeCalledTimes(2)
    expect(valueListener).toBeCalledWith(testValue2)
    expect(errorListener).toBeCalledTimes(0)

    const testValue3 = 'testValue3'
    subject.sendValue('wrongKey', testValue3)

    expect(valueListener).toBeCalledTimes(2)
    expect(errorListener).toBeCalledTimes(0)

    // doesn't receive messages after unsubscription
    listener.unsubscribe()
    const testValue4 = 'testValue4'
    subject.sendValue(key, testValue4)

    expect(valueListener).toBeCalledTimes(2)
    expect(errorListener).toBeCalledTimes(0)
  })

  it('check error', () => {
    const valueListener = jest.fn()
    const errorListener = jest.fn()
    const subject = new ObservableSubject()

    const key = 'testKey'
    subject.listen(key, { next: valueListener, error: errorListener })

    const errValue1 = 'errValue1'
    subject.sendError(key, errValue1)

    expect(valueListener).toBeCalledTimes(0)
    expect(errorListener).toBeCalledTimes(1)
    expect(errorListener).toBeCalledWith(errValue1)

    // unsubscribes on error, and doesn't receive messages
    const testValue1 = 'testValue1'
    subject.sendValue(key, testValue1)

    expect(valueListener).toBeCalledTimes(0)
    expect(errorListener).toBeCalledTimes(1)
  })
})
