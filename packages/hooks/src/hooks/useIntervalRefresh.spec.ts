import { renderHook } from '@testing-library/react-hooks'
import { FAST_INTERVAL, SLOW_INTERVAL, TIME_REFRESH_INTERVAL } from '../constants'
import { useIntervalRefresh } from './useIntervalRefresh'

describe('useIntervalRefresh hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  it('check slow interval', async () => {
    const { result } = renderHook(() => useIntervalRefresh(SLOW_INTERVAL))

    expect(result.current).toBe(0)
    jest.advanceTimersByTime(SLOW_INTERVAL - 10)
    expect(result.current).toBe(0)
    jest.advanceTimersByTime(10)

    expect(result.current).toBe(1)
    jest.advanceTimersByTime(SLOW_INTERVAL - 10)
    expect(result.current).toBe(1)
    jest.advanceTimersByTime(10)
    expect(result.current).toBe(2)
  })

  it('check fast interval', async () => {
    const { result } = renderHook(() => useIntervalRefresh(FAST_INTERVAL))

    expect(result.current).toBe(0)
    jest.advanceTimersByTime(FAST_INTERVAL - 10)
    expect(result.current).toBe(0)
    jest.advanceTimersByTime(10)

    expect(result.current).toBe(1)
    jest.advanceTimersByTime(FAST_INTERVAL - 10)
    expect(result.current).toBe(1)
    jest.advanceTimersByTime(10)
    expect(result.current).toBe(2)
  })

  it('check time refresh', async () => {
    const { result } = renderHook(() => useIntervalRefresh(TIME_REFRESH_INTERVAL))

    expect(result.current).toBe(0)
    jest.advanceTimersByTime(TIME_REFRESH_INTERVAL - 10)
    expect(result.current).toBe(0)
    jest.advanceTimersByTime(10)

    expect(result.current).toBe(1)
    jest.advanceTimersByTime(TIME_REFRESH_INTERVAL - 10)
    expect(result.current).toBe(1)
    jest.advanceTimersByTime(10)
    expect(result.current).toBe(2)
  })
})
