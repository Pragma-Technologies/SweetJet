import { useMemo, useRef } from 'react'
import { MemoizedRequests } from '../types'

export const useRequestMemo = (): MemoizedRequests => {
  const requestStorageRef = useRef<Record<string, Promise<unknown>>>({})

  return useMemo<MemoizedRequests>(() => {
    const hasRequest: MemoizedRequests['hasRequest'] = (key) => !!requestStorageRef.current[key]
    const getRequest: MemoizedRequests['getRequest'] = (key) => requestStorageRef.current[key]
    const deleteRequest: MemoizedRequests['deleteRequest'] = (key) => delete requestStorageRef.current[key]
    const setRequest: MemoizedRequests['setRequest'] = async (key, request) => {
      requestStorageRef.current[key] = request
      request.catch(() => undefined).finally(() => deleteRequest(key))
    }
    const memoizedRequest: MemoizedRequests['memoizedRequest'] = <T>(key: string, makeRequest: () => Promise<T>) => {
      if (!hasRequest(key)) {
        setRequest(key, makeRequest())
      }
      return getRequest(key) as Promise<T>
    }
    return { hasRequest, getRequest, setRequest, deleteRequest, memoizedRequest }
  }, [])
}
