export interface DateWithOutPlurals {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export interface Plurals {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

export interface DateWithPlurals {
  years: { count: number; key: string }
  months: { count: number; key: string }
  days: { count: number; key: string }
  hours: { count: number; key: string }
  minutes: { count: number; key: string }
  seconds: { count: number; key: string }
}
