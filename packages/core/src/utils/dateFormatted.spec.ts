import { DAY_IN_SECOND, MONTHS_IN_SECOND, YEAR_IN_SECOND } from '../constants'
import {
  getDateDetailsInfo,
  getDateDetailsInfoWithPeriod,
  getDateDetailsInfoWithPlurals,
  secondsToMillis,
} from './dateFormatted'

const dayInMillisec = 60 * 60 * 24 * 1000
const monthsInMillisec = dayInMillisec * 30
const yearInMillisec = monthsInMillisec * 12

const periodInSec1 = 77803694 // 2 years, 6 months, 0 days, 12 hours, 8 minutes and 14 seconds.
const periodInSec2 = 1803694 // 20 days, 21 hours, 1 minutes and 34 seconds.
const periodInSec3 = 7061 // 1 hours, 57 minutes and 41 seconds.
const periodInSec4 = 540 // 9 minutes and 0 seconds.
const periodInSec5 = 40 // 40 seconds.
const negativePeriodInSec = -40 // 0 seconds.

const startDate = 1675949824
const negativeStartDate = -1675949824
const negativeEndDate = -50

const plurals = { year: 'year', month: 'month', day: 'day', hour: 'hour', minute: 'minute', second: 'second' }

describe('encodeParams function', () => {
  it('check secondsToMillis utils', () => {
    const forTest = [
      { input: -10, output: 0 },
      { input: 0, output: 0 },
      { input: DAY_IN_SECOND, output: dayInMillisec },
      { input: MONTHS_IN_SECOND, output: monthsInMillisec },
      { input: YEAR_IN_SECOND, output: yearInMillisec },
      { input: 456.987, output: 456000 },
      { input: 456.34, output: 456000 },
    ]

    forTest.forEach(({ input, output }) => expect(secondsToMillis(input)).toStrictEqual(output))
  })

  it('check getDateDetailsInfo utils', () => {
    const forTest = [
      { input: periodInSec1, output: { years: 2, months: 6, days: 0, hours: 12, minutes: 8, seconds: 14 } },
      { input: periodInSec2, output: { years: 0, months: 0, days: 20, hours: 21, minutes: 1, seconds: 34 } },
      { input: periodInSec3, output: { years: 0, months: 0, days: 0, hours: 1, minutes: 57, seconds: 41 } },
      { input: periodInSec4, output: { years: 0, months: 0, days: 0, hours: 0, minutes: 9, seconds: 0 } },
      { input: periodInSec5, output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 40 } },
      { input: negativePeriodInSec, output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 } },
    ]

    forTest.forEach(({ input, output }) => expect(getDateDetailsInfo(input)).toStrictEqual(output))
  })

  it('check getDateDetailsInfoWithPeriod utils', () => {
    const forTest = [
      {
        input: { start: startDate, end: 1753753518 },
        output: { years: 2, months: 6, days: 0, hours: 12, minutes: 8, seconds: 14 },
      },
      {
        input: { start: startDate, end: 1677753518 },
        output: { years: 0, months: 0, days: 20, hours: 21, minutes: 1, seconds: 34 },
      },
      {
        input: { start: startDate, end: 1675956885 },
        output: { years: 0, months: 0, days: 0, hours: 1, minutes: 57, seconds: 41 },
      },
      {
        input: { start: startDate, end: 1675950364 },
        output: { years: 0, months: 0, days: 0, hours: 0, minutes: 9, seconds: 0 },
      },
      {
        input: { start: startDate, end: 1675949864 },
        output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 40 },
      },
      {
        input: { start: 1675949864, end: startDate },
        output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
      },
      {
        input: { start: 1675949864, end: negativeStartDate },
        output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
      },
      {
        input: { start: negativeStartDate, end: negativeEndDate },
        output: { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 },
      },
    ]
    forTest.forEach(({ input, output }) =>
      expect(getDateDetailsInfoWithPeriod(input.start, input.end)).toStrictEqual(output),
    )
  })

  it('check getDateDetailsInfoWithPlurals utils', () => {
    const forTest = [
      {
        input: periodInSec1,
        output: {
          years: { count: 2, key: 'year' },
          months: { count: 6, key: 'month' },
          days: { count: 0, key: 'day' },
          hours: { count: 12, key: 'hour' },
          minutes: { count: 8, key: 'minute' },
          seconds: { count: 14, key: 'second' },
        },
      },
      {
        input: periodInSec2,
        output: {
          years: { count: 0, key: 'year' },
          months: { count: 0, key: 'month' },
          days: { count: 20, key: 'day' },
          hours: { count: 21, key: 'hour' },
          minutes: { count: 1, key: 'minute' },
          seconds: { count: 34, key: 'second' },
        },
      },
      {
        input: negativePeriodInSec,
        output: {
          years: { count: 0, key: 'year' },
          months: { count: 0, key: 'month' },
          days: { count: 0, key: 'day' },
          hours: { count: 0, key: 'hour' },
          minutes: { count: 0, key: 'minute' },
          seconds: { count: 0, key: 'second' },
        },
      },
    ]

    forTest.forEach(({ input, output }) =>
      expect(getDateDetailsInfoWithPlurals(getDateDetailsInfo(input), plurals)).toStrictEqual(output),
    )
  })
})
