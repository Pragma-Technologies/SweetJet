import { useEffect, useState } from 'react'

export const useIntervalRefresh = (interval: number): number => {
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    if (interval < 0) {
      return
    }

    const intervalId = setInterval(() => setRefresh((prev) => ++prev), interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return refresh
}
