import { ConnectorBaseEnum, IStorable, StorageManager } from '@pragma-web-utils/core'
import { RequestedTransaction, Payload } from '../types'
import { StorableTransactionLike } from './StorableTransactionLike'

export abstract class StorableRequestedTx<
  C extends string | number = string | number,
  P extends Payload = Payload,
> extends StorableTransactionLike<C, P, RequestedTransaction<C, P>> {
  constructor(
    account: string,
    chainId: C,
    base: ConnectorBaseEnum,
    payload: P,
    _storageManager: StorageManager<IStorable<RequestedTransaction<C, P>>>,
  ) {
    const created = Date.now()
    const id: RequestedTransaction<C, P>['id'] = `${base}_${chainId}_${created}`
    super({ base, chainId, created, payload, account, id }, _storageManager)
  }
}
