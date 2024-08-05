import { Address, IStorable, StorageListenerTypeEnum } from '@pragma-web-utils/core'
import { Deps, Destructor } from '@pragma-web-utils/hooks'
import { useEffect, useRef } from 'react'
import { pendingStatuses, useTxService } from '../core'
import { Chain, Payload, TransactionLike } from '../types'
import { isTransaction } from '../utils'

export const useFinishPendingTransactionEffect = <P extends Payload>(
  relationInfo: Pick<TransactionLike, 'account' | 'chainId' | 'base'>,
  callback: () => Destructor | void,
  filter?: (payload: P) => boolean,
  deps: Deps = [],
): void => {
  const txService = useTxService<IStorable<TransactionLike<Chain, P>>>()
  const pendingCountRef = useRef(0)

  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const relatedRef = useRef(relationInfo)
  relatedRef.current = relationInfo

  useEffect(() => {
    let destructor: Destructor | void

    const listener = (list: TransactionLike<Chain, P>[]): void => {
      if (pendingCountRef.current !== list.length) {
        destructor = !list.length ? callbackRef.current() : undefined
      }
      pendingCountRef.current = list.length
    }

    const _filter = (tx: TransactionLike<Chain, P>) => {
      const isRelated = () => {
        const { base, chainId, account } = relatedRef.current
        return (
          tx.base === base && tx.chainId === chainId && new Address(tx.account).toHex() === new Address(account).toHex()
        )
      }
      const isFiltered = () => !filter || filter(tx.payload)
      const isPending = isTransaction(tx) && pendingStatuses.has(tx.status)
      return isPending && isFiltered() && isRelated()
    }

    const subscription = txService.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, listener, _filter)

    return () => {
      subscription.unsubscribe()
      destructor?.()
    }
  }, [txService, ...deps])
}
