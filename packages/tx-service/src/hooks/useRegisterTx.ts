import { useCallback } from 'react'
import { StorableRequestedTx, StorableTx, TxStatusChecker } from '../classes'
import { useTxService } from '../core'
import { Chain, Payload, Transaction, TxInfo } from '../types'

type RegisterTx<C extends Chain = Chain, P extends Payload = Payload> = (
  txInfo: Omit<TxInfo<C, P>, 'hash'>,
  checkers: Map<number, TxStatusChecker>,
  getNextTx: (tx: Transaction<C, P>) => Promise<Transaction<C, P> | null>,
  initTx: () => Promise<string>,
) => Promise<Transaction<C, P>>

export function useRegisterTx<C extends Chain = Chain, P extends Payload = Payload>(): RegisterTx<C, P> {
  const txService = useTxService()

  return useCallback(
    async ({ account, chainId, payload, base }, checkers, getNextTx, initTx) => {
      const requested = new StorableRequestedTx({ account, chainId, payload, base })
      txService.add(requested)
      try {
        const hash = await initTx()
        const tx = new StorableTx({ account, chainId, payload, base, hash }, checkers, getNextTx)
        txService.remove(requested.getId())
        txService.add(tx)
        return tx.getValue()
      } catch (error: unknown) {
        txService.remove(requested.getId())
        throw error
      }
    },
    [txService],
  )
}
