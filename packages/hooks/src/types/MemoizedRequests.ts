export interface MemoizedRequests {
  hasRequest: (key: string) => boolean
  getRequest: (key: string) => Promise<unknown>
  setRequest: (key: string, request: Promise<unknown>) => void
  deleteRequest: (key: string) => void
  memoizedRequest: <T>(key: string, makeRequest: () => Promise<T>) => Promise<T>
}
