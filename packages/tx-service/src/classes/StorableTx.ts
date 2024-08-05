import { StorageManager } from '@pragma-web-utils/core'
import { pendingStatuses } from '../core'
import { TransactionStatusEnum } from '../enums'
import { Chain, DestinationIndexPayload, Payload, Transaction, TxInfo } from '../types'
import { StorableTransactionLike } from './StorableTransactionLike'
import { TxStatusChecker } from './TxStatusChecker'

function getTxDTO<C extends Chain = Chain, P extends Payload = Payload>(
  info: TxInfo<C, P>,
  initialDestinationTxIndex = 0,
): Transaction<C, P> | Transaction<C, DestinationIndexPayload<P>> {
  const created = info.created ?? Date.now()
  const id: Transaction<C, P>['id'] = `${info.base}_${info.chainId}_${info.hash}`
  const tx = { ...info, created, id, status: info.status ?? TransactionStatusEnum.UNKNOWN } as Transaction<C, P>
  if (!!initialDestinationTxIndex) {
    ;(tx as Transaction<C, DestinationIndexPayload<P>>).payload.destinationTxIndex = initialDestinationTxIndex
  }
  let nextTxPointer: Transaction<C, P> | Transaction<C, DestinationIndexPayload<P>> | undefined = tx
  let index = initialDestinationTxIndex
  while (!!nextTxPointer && nextTxPointer.nextTx) {
    nextTxPointer.nextTx = { ...nextTxPointer.nextTx, id }
    nextTxPointer.nextTx.payload.destinationTxIndex = ++index
    nextTxPointer = nextTxPointer.nextTx
  }
  return tx
}

function numberify(value: unknown): number {
  return typeof value !== 'number' || Number.isNaN(value) ? 0 : value
}

export class StorableTx<C extends Chain = Chain, P extends Payload = Payload> extends StorableTransactionLike<
  C,
  P,
  Transaction<C, P>
> {
  constructor(
    _txInfo: TxInfo<C, P>,
    protected _checkers: Map<number, TxStatusChecker>,
    protected _getNextTx: (tx: Transaction<C, P>) => Promise<TxInfo<C, P> | null>,
    protected _waitTimeout = 5 * 60 * 1000,
  ) {
    super(getTxDTO(_txInfo))
  }

  addToStorage(storageManager: StorageManager<this>): void {
    super.addToStorage(storageManager)
    this._checkStatuses()
  }

  // update store by deep changes and on adding call again `_checkStatuses`
  // for update the list of destination tx by item added to store
  protected makeDeepUpdate(dto: Transaction<C, P>, updatedNextTx: Transaction<C, DestinationIndexPayload<P>>): void {
    const prevTx = dto.nextTx
    dto.nextTx = updatedNextTx
    const storableTx = new StorableTx(this._dto, this._checkers, this._getNextTx, this._waitTimeout)
    dto.nextTx = prevTx
    this._updateStoreValue(storableTx)
  }

  protected async _checkStatuses(): Promise<void> {
    // update status of source tx
    const updated = await this._updateDtoStatus(this._dto)
    // if status not changes, update the list of destination tx by current item
    if (updated === this._dto) {
      this._checkNextTxStatuses(this._dto)
      return
    }

    // else, trigger update store and on adding call again `_checkStatuses`
    // for update the list of destination tx by item added to store
    this._updateStoreValue(new StorableTx(updated, this._checkers, this._getNextTx, this._waitTimeout))
  }

  protected async _checkNextTxStatuses(dto: Transaction<C, P>): Promise<void> {
    const nextTx = await this._updateNextTx(dto)
    if (!nextTx) {
      return
    }

    if (!nextTx.hash) {
      // if hash doesn't exist, go to the next tx in list
      await this._checkNextTxStatuses(nextTx)
      return
    }

    if (dto.nextTx !== nextTx) {
      return this.makeDeepUpdate(dto, nextTx)
    }

    const updatedNextTx = await this._updateDtoStatus(nextTx)
    if (updatedNextTx !== nextTx) {
      return this.makeDeepUpdate(dto, updatedNextTx)
    }

    // if the status doesn't change, go to the next tx in list
    if (dto.nextTx) {
      await this._checkNextTxStatuses(dto.nextTx)
    }
  }

  protected async _updateDtoStatus<P0 extends P>(dto: Transaction<C, P0>): Promise<Transaction<C, P0>> {
    const checker = this._checkers.get(dto.chainId)
    if (!pendingStatuses.has(dto.status) || !checker) {
      return dto
    }

    const status = await checker.waitStatus(dto, { waitTimeout: this._waitTimeout })
    return !!status && status !== dto.status ? { ...dto, status } : dto
  }

  protected async _updateNextTx(
    dto: Transaction<C, P>,
  ): Promise<Transaction<C, DestinationIndexPayload<P>> | undefined> {
    if (dto.nextTx?.hash) {
      return dto.nextTx
    }

    let nextTx = await this._getNextTx(dto)
    if (!nextTx?.hash) {
      return dto.nextTx
    }

    return getTxDTO(nextTx, numberify(dto.payload.destinationTxIndex) + 1) as Transaction<C, DestinationIndexPayload<P>>
  }
}
