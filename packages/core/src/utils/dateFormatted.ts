import { DAY_IN_SECOND, MONTHS_IN_SECOND, YEAR_IN_SECOND } from '../constants'
import { DateWithOutPlurals, DateWithPlurals, Plurals } from '../types'

export function secondsToMillis(date: number): number {
  return date < 0 ? 0 : Math.floor(date) * 1000.0
}

export function getDateDetailsInfo(periodInSec: number): DateWithOutPlurals {
  if (periodInSec < 0) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const years = Math.floor(periodInSec / YEAR_IN_SECOND)

  periodInSec -= years * YEAR_IN_SECOND
  const months = Math.floor(periodInSec / MONTHS_IN_SECOND)

  periodInSec -= months * MONTHS_IN_SECOND
  const days = Math.floor(periodInSec / DAY_IN_SECOND)

  periodInSec -= days * DAY_IN_SECOND
  const hours = Math.floor(periodInSec / 3600)

  periodInSec -= hours * 3600
  const minutes = Math.floor(periodInSec / 60)

  periodInSec -= minutes * 60

  return { years, months, days, hours, minutes, seconds: periodInSec }
}

export function getDateDetailsInfoWithPeriod(startInSec: number, endInSec: number): DateWithOutPlurals {
  if (endInSec < 0 || startInSec < 0 || endInSec < startInSec) {
    return getDateDetailsInfo(0)
  }

  return getDateDetailsInfo(endInSec - startInSec)
}

export function getDateDetailsInfoWithPlurals(data: DateWithOutPlurals, pluralsKeys: Plurals): DateWithPlurals {
  return {
    years: { count: data.years, key: pluralsKeys.year },
    months: { count: data.months, key: pluralsKeys.month },
    days: { count: data.days, key: pluralsKeys.day },
    hours: { count: data.hours, key: pluralsKeys.hour },
    minutes: { count: data.minutes, key: pluralsKeys.minute },
    seconds: { count: data.seconds, key: pluralsKeys.second },
  }
}
