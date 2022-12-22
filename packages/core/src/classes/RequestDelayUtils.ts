<<<<<<< HEAD
import { wait } from './Wait'
import moment from 'moment'

export class RequestDelayUtils {
  private static _MAX_REQUEST_COUNT_IN_PERIOD = 3
  private static _PERIOD = 1000 // in milliseconds
  private static _queue: number[] = []

  public static async addDelay(): Promise<void> {
    const now = moment.now()
=======
import { wait } from '../utils'

export class RequestDelayUtils {
  protected static _MAX_REQUEST_COUNT_IN_PERIOD = 3
  protected static _PERIOD = 1000 // in milliseconds
  protected static _queue: number[] = []

  public static async addDelay(): Promise<void> {
    const now = Date.now()
>>>>>>> d148c9f23c83a9eef92ccde2986a0adbf4e3b01b
    // remove all request time moments which are not included more in the checked period
    RequestDelayUtils._queue = RequestDelayUtils._queue.filter((time) => time >= now - RequestDelayUtils._PERIOD)

    if (RequestDelayUtils._queue.length < RequestDelayUtils._MAX_REQUEST_COUNT_IN_PERIOD) {
      RequestDelayUtils._queue.push(now)
      return
    }

    // find time for counting start limit
    const currentPeriodStartTimeIndex = RequestDelayUtils._queue.length - RequestDelayUtils._MAX_REQUEST_COUNT_IN_PERIOD
    const currentPeriodStartTime = RequestDelayUtils._queue[currentPeriodStartTimeIndex]

    // calculate new delayed time and set delay
    const currentRequestTime = currentPeriodStartTime + RequestDelayUtils._PERIOD
    RequestDelayUtils._queue.push(currentRequestTime)
    await wait(currentRequestTime - now)
  }
<<<<<<< HEAD
=======

  public static setMaxRequestCount(value: number): void {
    if (value <= 0) {
      return
    }
    this._MAX_REQUEST_COUNT_IN_PERIOD = Math.round(value)
  }

  public static getMaxRequestCount(): number {
    return this._MAX_REQUEST_COUNT_IN_PERIOD
  }

  public static setDefaultDelay(value: number): void {
    if (value <= 0) {
      return
    }
    this._PERIOD = Math.round(value)
  }

  public static getDefaultDelay(): number {
    return this._PERIOD
  }
>>>>>>> d148c9f23c83a9eef92ccde2986a0adbf4e3b01b
}
