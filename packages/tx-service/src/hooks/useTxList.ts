import { IStorable, StorableValue, StorageListenerTypeEnum } from '@pragma-web-utils/core'
import { useEffect, useState } from 'react'
import { useTxService } from '../core'
import { MultichainTransaction, Transaction, TransactionLike } from '../types'
import { isMultichainTx, isTransaction } from '../utils'

type Deps = [] | [unknown, ...unknown[]]

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
  return useTxList<IStorable<Transaction>>(
    (item) => isTransaction(item) && !isMultichainTx(item) && (!filter || filter(item)),
    deps,
  )
}

export const useMultichainTxList = (
  filter?: (item: MultichainTransaction) => boolean,
  deps: Deps = [],
): MultichainTransaction[] => {
  return useTxList<IStorable<MultichainTransaction>>((item) => isMultichainTx(item) && (!filter || filter(item)), deps)
}
