import { useCallback } from 'react'
import { StorableMultichainTx, StorableRequestedTx, StorableTx, TxStatusChecker } from '../classes'
import { useTxService } from '../core'
import { Chain, MultichainTransaction, MultichainTxInfo, Payload, Transaction, TxInfo } from '../types'

type RegisterTx<C extends Chain = Chain, P extends Payload = Payload> = (
  txInfo: Omit<TxInfo<C, P>, 'hash'>,
  checker: TxStatusChecker,
  initTx: () => Promise<string>,
) => Promise<Transaction<C, P>>

type RegisterMultiChainTx<
  OriginChain extends Chain = Chain,
  DestinationChain extends Chain = Chain,
  P extends Payload = Payload,
> = (
  txInfo: Omit<MultichainTxInfo<OriginChain, DestinationChain, P>, 'hash'>,
  checker: TxStatusChecker,
  initTx: () => Promise<string>,
  getDestinationHash: (tx: MultichainTxInfo<OriginChain, DestinationChain, P>) => Promise<string | undefined>,
  waitTimeout?: number,
) => Promise<MultichainTransaction<OriginChain, DestinationChain, P>>

export function useRegisterTx<C extends Chain = Chain, P extends Payload = Payload>(): RegisterTx<C, P> {
  const txService = useTxService()

  return useCallback(
    async ({ account, chainId, payload, base }, checker, initTx) => {
      const requested = new StorableRequestedTx({ account, chainId, payload, base })
      txService.add(requested)
      try {
        const hash = await initTx()
        const tx = new StorableTx({ account, chainId, payload, base, hash }, checker)
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

export function useRegisterMultichainTx<
  OriginChain extends Chain = Chain,
  DestinationChain extends Chain = Chain,
  P extends Payload = Payload,
>(): RegisterMultiChainTx<OriginChain, DestinationChain, P> {
  const txService = useTxService()

  return useCallback(
    async (txInfo, checker, initTx, getDestinationHash, waitTimeout = 5 * 60 * 1000) => {
      const requested = new StorableRequestedTx(txInfo)
      txService.add(requested)
      try {
        const hash = await initTx()
        const tx = new StorableMultichainTx({ ...txInfo, hash }, checker, getDestinationHash, waitTimeout)
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
