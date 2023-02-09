import { DAY_IN_SECOND, MONTHS_IN_SECOND, YEAR_IN_SECOND } from '../constants'
import {
  secondsToMillis,
  getDateDetailsInfo,
  getDateDetailsInfoWithPlurals,
  getDateDetailsInfoWithPeriod,
} from './dateFormatted'

const negativeTimePeriodInSec = -10
const negativeTimePeriodInMillisec = 0
const zeroInSec = 0
const zeroInMillisec = 0
const dayInMillisec = 60 * 60 * 24 * 1000
const monthsInMillisec = dayInMillisec * 30
const yearInMillisec = monthsInMillisec * 12

const firstPeriodInSec = 77803694 // 2 years, 6 months, 0 days, 12 hours, 8 minutes and 14 seconds.
const secondPeriodInSec = 1803694 // 20 days, 21 hours, 1 minutes and 34 seconds.
const thirdPeriodInSec = 7061 // 1 hours, 57 minutes and 41 seconds.
const forthPeriodInSec = 540 // 9 minutes and 0 seconds.
const fifthPeriodInSec = 40 // 40 seconds.
const negativePeriodInSec = -40 // 0 seconds.

const startDate = 1675949824
const negativeStartDate = -1675949824
const negativeEndDate = -50
const endDate1 = 1753753518
const endDate2 = 1677753518
const endDate3 = 1675956885
const endDate4 = 1675950364
const endDate5 = 1675949864

const plurals = { year: 'year', month: 'month', day: 'day', hour: 'hour', minute: 'minute', second: 'second' }

describe('encodeParams function', () => {
  it('check secondsToMillis utils', () => {
    expect(secondsToMillis(negativeTimePeriodInSec)).toBe(negativeTimePeriodInMillisec)
    expect(secondsToMillis(zeroInSec)).toBe(zeroInMillisec)
    expect(secondsToMillis(DAY_IN_SECOND)).toBe(dayInMillisec)
    expect(secondsToMillis(MONTHS_IN_SECOND)).toBe(monthsInMillisec)
    expect(secondsToMillis(YEAR_IN_SECOND)).toBe(yearInMillisec)
  })

  it('check getDateDetailsInfo utils', () => {
    const date1 = getDateDetailsInfo(firstPeriodInSec)
    expect(date1.years).toBe(2)
    expect(date1.months).toBe(6)
    expect(date1.days).toBe(0)
    expect(date1.hours).toBe(12)
    expect(date1.minutes).toBe(8)
    expect(date1.seconds).toBe(14)

    const date2 = getDateDetailsInfo(secondPeriodInSec)
    expect(date2.years).toBe(0)
    expect(date2.months).toBe(0)
    expect(date2.days).toBe(20)
    expect(date2.hours).toBe(21)
    expect(date2.minutes).toBe(1)
    expect(date2.seconds).toBe(34)

    const date3 = getDateDetailsInfo(thirdPeriodInSec)
    expect(date3.years).toBe(0)
    expect(date3.months).toBe(0)
    expect(date3.days).toBe(0)
    expect(date3.hours).toBe(1)
    expect(date3.minutes).toBe(57)
    expect(date3.seconds).toBe(41)

    const date4 = getDateDetailsInfo(forthPeriodInSec)
    expect(date4.years).toBe(0)
    expect(date4.months).toBe(0)
    expect(date4.days).toBe(0)
    expect(date4.hours).toBe(0)
    expect(date4.minutes).toBe(9)
    expect(date4.seconds).toBe(0)

    const date5 = getDateDetailsInfo(fifthPeriodInSec)
    expect(date5.years).toBe(0)
    expect(date5.months).toBe(0)
    expect(date5.days).toBe(0)
    expect(date5.hours).toBe(0)
    expect(date5.minutes).toBe(0)
    expect(date5.seconds).toBe(40)

    const negativeDate = getDateDetailsInfo(negativePeriodInSec)
    expect(negativeDate.years).toBe(0)
    expect(negativeDate.months).toBe(0)
    expect(negativeDate.days).toBe(0)
    expect(negativeDate.hours).toBe(0)
    expect(negativeDate.minutes).toBe(0)
    expect(negativeDate.seconds).toBe(0)
  })

  it('check getDateDetailsInfoWithPeriod utils', () => {
    const period1 = getDateDetailsInfoWithPeriod(startDate, endDate1)
    expect(period1.years).toBe(2)
    expect(period1.months).toBe(6)
    expect(period1.days).toBe(0)
    expect(period1.hours).toBe(12)
    expect(period1.minutes).toBe(8)
    expect(period1.seconds).toBe(14)

    const period2 = getDateDetailsInfoWithPeriod(startDate, endDate2)
    expect(period2.years).toBe(0)
    expect(period2.months).toBe(0)
    expect(period2.days).toBe(20)
    expect(period2.hours).toBe(21)
    expect(period2.minutes).toBe(1)
    expect(period2.seconds).toBe(34)

    const period3 = getDateDetailsInfoWithPeriod(startDate, endDate3)
    expect(period3.years).toBe(0)
    expect(period3.months).toBe(0)
    expect(period3.days).toBe(0)
    expect(period3.hours).toBe(1)
    expect(period3.minutes).toBe(57)
    expect(period3.seconds).toBe(41)

    const period4 = getDateDetailsInfoWithPeriod(startDate, endDate4)
    expect(period4.years).toBe(0)
    expect(period4.months).toBe(0)
    expect(period4.days).toBe(0)
    expect(period4.hours).toBe(0)
    expect(period4.minutes).toBe(9)
    expect(period4.seconds).toBe(0)

    const period5 = getDateDetailsInfoWithPeriod(startDate, endDate5)
    expect(period5.years).toBe(0)
    expect(period5.months).toBe(0)
    expect(period5.days).toBe(0)
    expect(period5.hours).toBe(0)
    expect(period5.minutes).toBe(0)
    expect(period5.seconds).toBe(40)

    const period6 = getDateDetailsInfoWithPeriod(endDate5, startDate)
    expect(period6.years).toBe(0)
    expect(period6.months).toBe(0)
    expect(period6.days).toBe(0)
    expect(period6.hours).toBe(0)
    expect(period6.minutes).toBe(0)
    expect(period6.seconds).toBe(0)

    const period7 = getDateDetailsInfoWithPeriod(endDate5, negativeStartDate)
    expect(period7.years).toBe(0)
    expect(period7.months).toBe(0)
    expect(period7.days).toBe(0)
    expect(period7.hours).toBe(0)
    expect(period7.minutes).toBe(0)
    expect(period7.seconds).toBe(0)

    const period8 = getDateDetailsInfoWithPeriod(negativeStartDate, negativeEndDate)
    expect(period8.years).toBe(0)
    expect(period8.months).toBe(0)
    expect(period8.days).toBe(0)
    expect(period8.hours).toBe(0)
    expect(period8.minutes).toBe(0)
    expect(period8.seconds).toBe(0)
  })

  it('check getDateDetailsInfoWithPlurals utils', () => {
    const period1 = getDateDetailsInfo(firstPeriodInSec)
    const dateInfo1 = getDateDetailsInfoWithPlurals(period1, plurals)
    expect(dateInfo1.years.count).toBe(2)
    expect(dateInfo1.years.key).toBe('year')
    expect(dateInfo1.months.count).toBe(6)
    expect(dateInfo1.months.key).toBe('month')
    expect(dateInfo1.days.count).toBe(0)
    expect(dateInfo1.days.key).toBe('day')
    expect(dateInfo1.hours.count).toBe(12)
    expect(dateInfo1.hours.key).toBe('hour')
    expect(dateInfo1.minutes.count).toBe(8)
    expect(dateInfo1.minutes.key).toBe('minute')
    expect(dateInfo1.seconds.count).toBe(14)
    expect(dateInfo1.seconds.key).toBe('second')

    const period2 = getDateDetailsInfo(secondPeriodInSec)
    const dateInfo2 = getDateDetailsInfoWithPlurals(period2, plurals)
    expect(dateInfo2.years.count).toBe(0)
    expect(dateInfo2.years.key).toBe('year')
    expect(dateInfo2.months.count).toBe(0)
    expect(dateInfo2.months.key).toBe('month')
    expect(dateInfo2.days.count).toBe(20)
    expect(dateInfo2.days.key).toBe('day')
    expect(dateInfo2.hours.count).toBe(21)
    expect(dateInfo2.hours.key).toBe('hour')
    expect(dateInfo2.minutes.count).toBe(1)
    expect(dateInfo2.minutes.key).toBe('minute')
    expect(dateInfo2.seconds.count).toBe(34)
    expect(dateInfo2.seconds.key).toBe('second')

    const period3 = getDateDetailsInfo(negativePeriodInSec)
    const dateInfo3 = getDateDetailsInfoWithPlurals(period3, plurals)
    expect(dateInfo3.years.count).toBe(0)
    expect(dateInfo3.years.key).toBe('year')
    expect(dateInfo3.months.count).toBe(0)
    expect(dateInfo3.months.key).toBe('month')
    expect(dateInfo3.days.count).toBe(0)
    expect(dateInfo3.days.key).toBe('day')
    expect(dateInfo3.hours.count).toBe(0)
    expect(dateInfo3.hours.key).toBe('hour')
    expect(dateInfo3.minutes.count).toBe(0)
    expect(dateInfo3.minutes.key).toBe('minute')
    expect(dateInfo3.seconds.count).toBe(0)
    expect(dateInfo3.seconds.key).toBe('second')
  })
})
