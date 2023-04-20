import { IStorable, StorableValue, StorageListenerTypeEnum } from '@pragma-web-utils/core'
import { Deps, Destructor } from '@pragma-web-utils/hooks'
import { useEffect, useRef } from 'react'
import { useTxService } from '../core'

export const useTransactionListChangesEffect = <T extends IStorable>(
  callback: (list: StorableValue<T>[]) => Destructor | void,
  filter?: (tx: StorableValue<T>) => boolean,
  deps: Deps = [],
): void => {
  const txService = useTxService<T>()
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let onUnsubscribe: Destructor | void
    const subscription = txService.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      (data) => (onUnsubscribe = callbackRef.current(data)),
      filter,
    )
    return () => {
      subscription.unsubscribe()
      onUnsubscribe?.()
    }
  }, [txService, ...deps])
}
