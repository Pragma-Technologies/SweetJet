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
const fractionalDateInSec1 = 456.987
const fractionalDateInMillisec1 = 457000
const fractionalDateInSec2 = 456.34
const fractionalDateInMillisec2 = 456000

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

const checkFunc = (forTest: { output: string | number; input: number | string }[]) => {
  for (let index = 0; index < forTest.length; index++) {
    expect(forTest[index].input).toBe(forTest[index].output)
  }
}

describe('encodeParams function', () => {
  it('check secondsToMillis utils', () => {
    const forTest = [
      { input: negativeTimePeriodInSec, output: negativeTimePeriodInMillisec },
      { input: zeroInSec, output: zeroInMillisec },
      { input: DAY_IN_SECOND, output: dayInMillisec },
      { input: MONTHS_IN_SECOND, output: monthsInMillisec },
      { input: YEAR_IN_SECOND, output: yearInMillisec },
      { input: fractionalDateInSec1, output: fractionalDateInMillisec1 },
      { input: fractionalDateInSec2, output: fractionalDateInMillisec2 },
    ]

    for (let index = 0; index < forTest.length; index++) {
      expect(secondsToMillis(forTest[index].input)).toBe(forTest[index].output)
    }
  })

  it('check getDateDetailsInfo utils', () => {
    const date1 = getDateDetailsInfo(firstPeriodInSec)
    const date2 = getDateDetailsInfo(secondPeriodInSec)

    const forTest1 = [
      { input: date1.years, output: 2 },
      { input: date1.months, output: 6 },
      { input: date1.days, output: 0 },
      { input: date1.hours, output: 12 },
      { input: date1.minutes, output: 8 },
      { input: date1.seconds, output: 14 },

      { input: date2.years, output: 0 },
      { input: date2.months, output: 0 },
      { input: date2.days, output: 20 },
      { input: date2.hours, output: 21 },
      { input: date2.minutes, output: 1 },
      { input: date2.seconds, output: 34 },
    ]

    checkFunc(forTest1)

    const date3 = getDateDetailsInfo(thirdPeriodInSec)
    const date4 = getDateDetailsInfo(forthPeriodInSec)

    const forTest2 = [
      { input: date3.years, output: 0 },
      { input: date3.months, output: 0 },
      { input: date3.days, output: 0 },
      { input: date3.hours, output: 1 },
      { input: date3.minutes, output: 57 },
      { input: date3.seconds, output: 41 },

      { input: date4.years, output: 0 },
      { input: date4.months, output: 0 },
      { input: date4.days, output: 0 },
      { input: date4.hours, output: 0 },
      { input: date4.minutes, output: 9 },
      { input: date4.seconds, output: 0 },
    ]

    checkFunc(forTest2)

    const date5 = getDateDetailsInfo(fifthPeriodInSec)
    const negativeDate = getDateDetailsInfo(negativePeriodInSec)

    const forTest3 = [
      { input: date5.years, output: 0 },
      { input: date5.months, output: 0 },
      { input: date5.days, output: 0 },
      { input: date5.hours, output: 0 },
      { input: date5.minutes, output: 0 },
      { input: date5.seconds, output: 40 },

      { input: negativeDate.years, output: 0 },
      { input: negativeDate.months, output: 0 },
      { input: negativeDate.days, output: 0 },
      { input: negativeDate.hours, output: 0 },
      { input: negativeDate.minutes, output: 0 },
      { input: negativeDate.seconds, output: 0 },
    ]

    checkFunc(forTest3)
  })

  it('check getDateDetailsInfoWithPeriod utils', () => {
    const period1 = getDateDetailsInfoWithPeriod(startDate, endDate1)
    const period2 = getDateDetailsInfoWithPeriod(startDate, endDate2)

    const forTest1 = [
      { input: period1.years, output: 2 },
      { input: period1.months, output: 6 },
      { input: period1.days, output: 0 },
      { input: period1.hours, output: 12 },
      { input: period1.minutes, output: 8 },
      { input: period1.seconds, output: 14 },

      { input: period2.years, output: 0 },
      { input: period2.months, output: 0 },
      { input: period2.days, output: 20 },
      { input: period2.hours, output: 21 },
      { input: period2.minutes, output: 1 },
      { input: period2.seconds, output: 34 },
    ]
    checkFunc(forTest1)

    const period3 = getDateDetailsInfoWithPeriod(startDate, endDate3)
    const period4 = getDateDetailsInfoWithPeriod(startDate, endDate4)

    const forTest2 = [
      { input: period3.years, output: 0 },
      { input: period3.months, output: 0 },
      { input: period3.days, output: 0 },
      { input: period3.hours, output: 1 },
      { input: period3.minutes, output: 57 },
      { input: period3.seconds, output: 41 },

      { input: period4.years, output: 0 },
      { input: period4.months, output: 0 },
      { input: period4.days, output: 0 },
      { input: period4.hours, output: 0 },
      { input: period4.minutes, output: 9 },
      { input: period4.seconds, output: 0 },
    ]
    checkFunc(forTest2)

    const period5 = getDateDetailsInfoWithPeriod(startDate, endDate5)
    const period6 = getDateDetailsInfoWithPeriod(endDate5, startDate)

    const forTest3 = [
      { input: period5.years, output: 0 },
      { input: period5.months, output: 0 },
      { input: period5.days, output: 0 },
      { input: period5.hours, output: 0 },
      { input: period5.minutes, output: 0 },
      { input: period5.seconds, output: 40 },

      { input: period6.years, output: 0 },
      { input: period6.months, output: 0 },
      { input: period6.days, output: 0 },
      { input: period6.hours, output: 0 },
      { input: period6.minutes, output: 0 },
      { input: period6.seconds, output: 0 },
    ]
    checkFunc(forTest3)

    const period7 = getDateDetailsInfoWithPeriod(endDate5, negativeStartDate)
    const period8 = getDateDetailsInfoWithPeriod(negativeStartDate, negativeEndDate)

    const forTest4 = [
      { input: period7.years, output: 0 },
      { input: period7.months, output: 0 },
      { input: period7.days, output: 0 },
      { input: period7.hours, output: 0 },
      { input: period7.minutes, output: 0 },
      { input: period7.seconds, output: 0 },

      { input: period8.years, output: 0 },
      { input: period8.months, output: 0 },
      { input: period8.days, output: 0 },
      { input: period8.hours, output: 0 },
      { input: period8.minutes, output: 0 },
      { input: period8.seconds, output: 0 },
    ]
    checkFunc(forTest4)
  })

  it('check getDateDetailsInfoWithPlurals utils', () => {
    const period1 = getDateDetailsInfo(firstPeriodInSec)
    const dateInfo1 = getDateDetailsInfoWithPlurals(period1, plurals)

    const forTest = [
      { input: dateInfo1.years.count, output: 2 },
      { input: dateInfo1.years.key, output: 'year' },
      { input: dateInfo1.months.count, output: 6 },
      { input: dateInfo1.months.key, output: 'month' },
      { input: dateInfo1.days.count, output: 0 },
      { input: dateInfo1.days.key, output: 'day' },
      { input: dateInfo1.hours.count, output: 12 },
      { input: dateInfo1.hours.key, output: 'hour' },
      { input: dateInfo1.minutes.count, output: 8 },
      { input: dateInfo1.minutes.key, output: 'minute' },
      { input: dateInfo1.seconds.count, output: 14 },
      { input: dateInfo1.seconds.key, output: 'second' },
    ]
    checkFunc(forTest)

    const period2 = getDateDetailsInfo(secondPeriodInSec)
    const dateInfo2 = getDateDetailsInfoWithPlurals(period2, plurals)
    const forTest1 = [
      { input: dateInfo2.years.count, output: 0 },
      { input: dateInfo2.years.key, output: 'year' },
      { input: dateInfo2.months.count, output: 0 },
      { input: dateInfo2.months.key, output: 'month' },
      { input: dateInfo2.days.count, output: 20 },
      { input: dateInfo2.days.key, output: 'day' },
      { input: dateInfo2.hours.count, output: 21 },
      { input: dateInfo2.hours.key, output: 'hour' },
      { input: dateInfo2.minutes.count, output: 1 },
      { input: dateInfo2.minutes.key, output: 'minute' },
      { input: dateInfo2.seconds.count, output: 34 },
      { input: dateInfo2.seconds.key, output: 'second' },
    ]
    checkFunc(forTest1)

    const period3 = getDateDetailsInfo(negativePeriodInSec)
    const dateInfo3 = getDateDetailsInfoWithPlurals(period3, plurals)
    const forTest2 = [
      { input: dateInfo3.years.count, output: 0 },
      { input: dateInfo3.years.key, output: 'year' },
      { input: dateInfo3.months.count, output: 0 },
      { input: dateInfo3.months.key, output: 'month' },
      { input: dateInfo3.days.count, output: 0 },
      { input: dateInfo3.days.key, output: 'day' },
      { input: dateInfo3.hours.count, output: 0 },
      { input: dateInfo3.hours.key, output: 'hour' },
      { input: dateInfo3.minutes.count, output: 0 },
      { input: dateInfo3.minutes.key, output: 'minute' },
      { input: dateInfo3.seconds.count, output: 0 },
      { input: dateInfo3.seconds.key, output: 'second' },
    ]
    checkFunc(forTest2)
  })
})
