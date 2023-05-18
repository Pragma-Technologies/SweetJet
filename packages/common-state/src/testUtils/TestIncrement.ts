import { wait } from '@pragma-web-utils/core'

export class TestIncrementor {
  protected _value = 0
  protected _nextError: undefined | { error: unknown } = undefined

  async increment(): Promise<number> {
    await wait(100)

    if (!!this._nextError) {
      const error = this._nextError.error
      this._nextError = undefined
      throw error
    }

    return this._value++
  }

  setValue(value: number): void {
    this._value = value
  }

  refresh(): void {
    this._value = 0
    this._nextError = undefined
  }

  setErrorOnNextIncrementInit(error: unknown): void {
    this._nextError = { error }
  }
}
