import { Payload, RequestedTransaction, TxRequestedInfo } from '../types'
import { StorableTransactionLike } from './StorableTransactionLike'

function getTxDTO<C extends string | number = string | number, P extends Payload = Payload>(
  txInfo: TxRequestedInfo<C, P>,
): RequestedTransaction<C, P> {
  const created = txInfo.created ?? Date.now()
  const id: RequestedTransaction<C, P>['id'] = `${txInfo.base}_${txInfo.chainId}_${created}`
  return { ...txInfo, created, id }
}

export class StorableRequestedTx<
  C extends string | number = string | number,
  P extends Payload = Payload,
> extends StorableTransactionLike<C, P, RequestedTransaction<C, P>> {
  constructor(txInfo: TxRequestedInfo<C, P>) {
    super(getTxDTO(txInfo))
  }
}
