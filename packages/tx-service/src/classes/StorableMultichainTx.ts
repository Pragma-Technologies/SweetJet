import { StorageManager, wait } from '@pragma-web-utils/core'
import { pendingStatuses } from '../core'
import { TransactionStatusEnum } from '../enums'
import { MultichainTransaction, MultichainTxInfo, Payload } from '../types'
import { isTxCheckInfo } from '../utils'
import { StorableTransactionLike } from './StorableTransactionLike'
import { TxStatusChecker } from './TxStatusChecker'

function getTxDTO<
  OriginChain extends string | number = string | number,
  DestinationChain extends string | number = string | number,
  P extends Payload = Payload,
>(info: MultichainTxInfo<OriginChain, DestinationChain, P>): MultichainTransaction<OriginChain, DestinationChain, P> {
  const created = Date.now()
  const id: MultichainTransaction<OriginChain, DestinationChain, P>['id'] = `${info.base}_${info.chainId}_${info.hash}`
  return {
    ...info,
    destination: {
      ...info.destination,
      status: 'status' in info.destination ? info.destination.status : TransactionStatusEnum.UNKNOWN,
    },
    created,
    id,
    status: info.status ?? TransactionStatusEnum.UNKNOWN,
  }
}

export class StorableMultichainTx<
  OriginChain extends string | number = string | number,
  DestinationChain extends string | number = string | number,
  P extends Payload = Payload,
> extends StorableTransactionLike<OriginChain, P, MultichainTransaction<OriginChain, DestinationChain, P>> {
  constructor(
    _txInfo: MultichainTxInfo<OriginChain, DestinationChain, P>,
    protected _originChecker: TxStatusChecker,
    protected _destinationChecker: TxStatusChecker,
    protected _getDestinationHash: (
      tx: MultichainTxInfo<OriginChain, DestinationChain, P>,
    ) => Promise<string | undefined>,
    protected _waitTimeout = 5 * 60 * 1000,
  ) {
    super(getTxDTO(_txInfo))
  }

  addToStorage(storageManager: StorageManager<this>): void {
    super.addToStorage(storageManager)
    this._checkStatus()
  }

  protected async _checkStatus(): Promise<void> {
    if (this._storageManager?.getItem(this._dto.id) === this && pendingStatuses.has(this._dto.status)) {
      await this._checkOriginStatus()
    }
    if (this._storageManager?.getItem(this._dto.id) === this && pendingStatuses.has(this._dto.destination.status)) {
      await this._checkDestinationStatus()
    }
  }

  protected async _checkOriginStatus(): Promise<void> {
    const status = await this._originChecker.waitStatus(this._dto, { waitTimeout: this._waitTimeout })
    if (!!status && status !== this._dto.status) {
      this._updateStoreValue(
        new StorableMultichainTx(
          { ...this._dto, status },
          this._originChecker,
          this._destinationChecker,
          this._getDestinationHash,
          this._waitTimeout,
        ),
      )
    }
  }

  protected async _checkDestinationStatus(): Promise<void> {
    const destination = this._dto.destination
    // if hash not defined wait hash
    if (!destination.hash) {
      const hash = await this._getDestinationTx()
      if (!hash) {
        return
      }

      this._updateStoreValue(
        new StorableMultichainTx(
          {
            ...this._dto,
            destination: { ...this._dto.destination, hash },
          },
          this._originChecker,
          this._destinationChecker,
          this._getDestinationHash,
          this._waitTimeout,
        ),
      )
      return
    }

    if (!isTxCheckInfo(destination)) {
      return
    }
    const status = await this._destinationChecker.waitStatus(destination, { waitTimeout: this._waitTimeout })
    if (!!status && status !== this._dto.destination.status) {
      this._updateStoreValue(
        new StorableMultichainTx(
          {
            ...this._dto,
            destination: { ...this._dto.destination, status },
          },
          this._originChecker,
          this._destinationChecker,
          this._getDestinationHash,
          this._waitTimeout,
        ),
      )
    }
  }

  protected async _getDestinationTx(): Promise<string | undefined> {
    // TODO: check if failed transfer transaction to destination network and mark tx as without destination transaction
    const isOldCreated = Date.now() - this._dto.created > 2 * this._waitTimeout
    if (isOldCreated) {
      return undefined
    }

    const start = Date.now()
    let destinationHash = await this._getDestinationHash(this._dto)

    const isTimeoutFinished = Date.now() - start > this._waitTimeout
    const needWaitingResult = !this._waitTimeout || (!isTimeoutFinished && !isOldCreated)

    while (!destinationHash && needWaitingResult) {
      await wait(30_000)
      destinationHash = await this._getDestinationHash(this._dto)
    }
    return destinationHash
  }
}
