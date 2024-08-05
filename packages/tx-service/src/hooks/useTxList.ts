import { IStorable, StorableValue, StorageListenerTypeEnum } from '@pragma-web-utils/core'
import { Deps } from '@pragma-web-utils/hooks'
import { useEffect, useState } from 'react'
import { useTxService } from '../core'
import { Transaction, TransactionLike } from '../types'
import { isTransaction } from '../utils'

export const useTxList = <T extends IStorable<TransactionLike>>(
  filter?: (item: StorableValue<T>) => boolean,
  deps: Deps = [],
): StorableValue<T>[] => {
  const txService = useTxService<T>()
  const [list, setList] = useState(() => txService.getList(filter))

  useEffect(
    () => txService.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, setList, filter).unsubscribe,
    [txService, ...deps],
  )

  return list
}

export const useTransactionList = (filter?: (item: Transaction) => boolean, deps: Deps = []): Transaction[] => {
  return useTxList<IStorable<Transaction>>((item) => isTransaction(item) && (!filter || filter(item)), deps)
}
