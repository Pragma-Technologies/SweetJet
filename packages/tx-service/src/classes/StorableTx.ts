import { IStorable, StorageManager } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { Transaction, Payload, TxInfo } from '../types'
import { StorableTransactionLike } from './StorableTransactionLike'
import { TxStatusChecker } from './TxStatusChecker'

function getTxDTO<C extends string | number = string | number, P extends Payload = Payload>(
  info: TxInfo<C, P>,
): Transaction<C, P> {
  const created = Date.now()
  const id: Transaction<C, P>['id'] = `${info.base}_${info.chainId}_${info.hash}`
  return { ...info, created, id, status: info.status ?? TransactionStatusEnum.UNKNOWN }
}

export abstract class StorableTx<
  C extends string | number = string | number,
  P extends Payload = Payload,
> extends StorableTransactionLike<C, P, Transaction<C, P>> {
  constructor(
    _txInfo: TxInfo<C, P>,
    protected _checker: TxStatusChecker,
    protected _waitTimeout = 5 * 60 * 1000,
    _storageManager: StorageManager<IStorable<Transaction<C, P>>>,
  ) {
    super(getTxDTO(_txInfo), _storageManager)
    if (this._dto.status === TransactionStatusEnum.UNKNOWN || this._dto.status === TransactionStatusEnum.PENDING) {
      this._checkStatus()
    }
  }

  protected async _checkStatus(): Promise<void> {
    const status = await this._checker.waitStatus(this._dto, { waitTimeout: this._waitTimeout })
    if (!!status && status !== this._dto.status) {
      this._dto.status = status ?? this._dto.status
      this._updateStoreValue()
    }
  }
}
