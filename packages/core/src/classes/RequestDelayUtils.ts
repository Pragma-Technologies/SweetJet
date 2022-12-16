import { wait } from './Wait'
import moment from 'moment'

export class RequestDelayUtils {
  private static _MAX_REQUEST_COUNT_IN_PERIOD = 3
  private static _PERIOD = 1000 // in milliseconds
  private static _queue: number[] = []

  public static async addDelay(): Promise<void> {
    const now = moment.now()
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
}
