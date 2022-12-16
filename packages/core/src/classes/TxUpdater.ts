import { ConnectorBaseEnum } from '@pragma-web-utils/types/src/enums/ConnectorBaseEnum'
import { TransactionStatusEnum } from '@pragma-web-utils/types/src/enums/TransactionStatusEnum'
import { TxListenerTypeEnum } from '@pragma-web-utils/types/src/enums/TxListenerTypeEnum'
import {
  EthNetworkInfo,
  GetDestinationTransactionHash,
  Transaction,
  TronNetworkInfo,
  Tx,
  WaitTxStatusOptions,
} from '@pragma-web-utils/types/src/interfaces/Transaction'
import {
  MultichainDestinationInfoCore,
  MultichainTransaction,
} from '@pragma-web-utils/types/src/interfaces/TransactionMultichain'
import { TxListenerSubscription } from '@pragma-web-utils/types/src/interfaces/TxListener'
import { isMultichainTx, isTransaction } from './TxChecksUtils'
import { EthTxStatusChecker } from './TxEthStatusChecker'
import { TxStatusChecker } from './TxStatusChecker'
import { TxStorage } from './TxStorage'
import { TronTxStatusChecker } from './TxTronStatusChecker'
import { wait } from './Wait'

export class TxUpdater {
  protected _ethCheckers: Map<string | number, EthTxStatusChecker> = new Map<string | number, EthTxStatusChecker>()
  protected _tronCheckers: Map<string | number, TronTxStatusChecker> = new Map<string | number, TronTxStatusChecker>()
  protected _subscriptions: TxListenerSubscription[] = []
  protected _isActive = false

  constructor(
    protected _txStorage: TxStorage,
    networkInfos: (EthNetworkInfo | TronNetworkInfo)[],
    protected _getDestinationTransactionHash: GetDestinationTransactionHash,
    protected _waitTimeout = 5 * 60 * 1000,
  ) {
    this._initNetworkInfos(networkInfos)
  }

  public initListeners(): void {
    this._isActive = true
    if (!!this._subscriptions.length) {
      return
    }
    this._listenAddingTx()
    this._listenPendingTx()
  }

  public stopListeners(): void {
    this._subscriptions.forEach((listener) => listener.unsubscribe())
    this._isActive = false
  }

  protected _initNetworkInfos(networkInfos: (EthNetworkInfo | TronNetworkInfo)[]): void {
    networkInfos.forEach((info) => {
      switch (info.base) {
        case ConnectorBaseEnum.EVM:
          this._ethCheckers.set(info.chainId, new EthTxStatusChecker(info.chainId, info.rpcUrl))
          break
        case ConnectorBaseEnum.TVM:
          this._tronCheckers.set(info.chainId, new TronTxStatusChecker(info.chainId, info.grpcUrl))
          break
      }
    })
  }

  // TODO: merge with _listenAddingTx
  // on init check status for pending and unknown transactions
  protected _listenPendingTx(): void {
    const filter = (tx: Tx) => {
      const statusForUpdateList = new Set([TransactionStatusEnum.PENDING, TransactionStatusEnum.UNKNOWN])
      if (isMultichainTx(tx)) {
        return (
          statusForUpdateList.has(tx.origin.status) ||
          (tx.origin.status === TransactionStatusEnum.SUCCESS &&
            (!tx.destination || statusForUpdateList.has(tx.destination?.status)))
        )
      } else if (isTransaction(tx)) {
        return statusForUpdateList.has(tx.status)
      }
      return false
    }

    this._txStorage.getTxList(filter).forEach((tx) => {
      if (isMultichainTx(tx)) {
        this._onAddingMultichainTx(tx)
      } else if (isTransaction(tx)) {
        this._onAddingUsualTx(tx)
      }
    })
  }

  protected _listenAddingTx(): void {
    const filter = (tx: Tx) => {
      if (isMultichainTx(tx)) {
        return tx.origin.status === TransactionStatusEnum.PENDING
      } else if (isTransaction(tx)) {
        return tx.status === TransactionStatusEnum.PENDING
      }
      return false
    }
    const onEvent = (tx: Tx) => {
      if (isMultichainTx(tx)) {
        this._onAddingMultichainTx(tx)
      } else if (isTransaction(tx)) {
        this._onAddingUsualTx(tx)
      }
    }
    const subscription = this._txStorage.addListener(TxListenerTypeEnum.ON_ADD_TX, onEvent, filter)
    this._subscriptions.push(subscription)
  }

  protected async _onAddingMultichainTx(tx: MultichainTransaction): Promise<void> {
    /**
     * wait status of origin tx and update it
     */
    const waitingOptions: WaitTxStatusOptions = { waitTimeout: this._waitTimeout }
    const originStatus = await this._getChecker(tx.origin).waitStatus(tx.origin, waitingOptions)

    if (!this._isActive) {
      return
    }
    this._txStorage.updateTx(tx.id, { origin: { status: originStatus } })

    /**
     * get destination tx and set it to stored MultichainTransaction
     */
    const destinationTx = tx.destination || (await this._getDestinationTx(tx))
    if (!destinationTx || !this._isActive) {
      return
    }
    this._txStorage.addDestinationTransaction(tx.id, destinationTx)

    /**
     * wait status of destination tx and update it
     */
    const destinationStatus = await this._getChecker(destinationTx).waitStatus(destinationTx, waitingOptions)

    if (this._isActive) {
      this._txStorage.updateTx(tx.id, { destination: { status: destinationStatus } })
    }
  }

  protected async _onAddingUsualTx(tx: Transaction): Promise<void> {
    const status = await this._getChecker(tx).waitStatus(tx, { waitTimeout: this._waitTimeout })
    this._isActive && this._txStorage.updateTx(tx.id, { status })
  }

  protected _getChecker(tx: Transaction): TxStatusChecker {
    switch (tx.base) {
      case ConnectorBaseEnum.TVM:
        return this._tronCheckers.get(tx.chainId)!
      case ConnectorBaseEnum.EVM:
        return this._ethCheckers.get(tx.chainId)!
    }
  }

  protected async _getDestinationTx(tx: MultichainTransaction): Promise<Transaction | null> {
    // TODO: check if failed transfer transaction to destination network and mark tx as without destination transaction
    const isOldCreated = Date.now() - tx.origin.created > 2 * this._waitTimeout
    if (isOldCreated) {
      return null
    }

    const destinationSetupInfo: MultichainDestinationInfoCore = {
      base: tx.destinationBase,
      chainId: tx.destinationChainId,
    }
    const start = Date.now()
    let destinationHash = await this._getDestinationTransactionHash(tx.origin, destinationSetupInfo)

    const isTimeoutFinished = Date.now() - start > this._waitTimeout
    const needWaitingResult = !this._waitTimeout || (!isTimeoutFinished && !isOldCreated)

    while (!destinationHash && needWaitingResult) {
      await wait(30_000)
      destinationHash = await this._getDestinationTransactionHash(tx.origin, destinationSetupInfo)
    }
    return !destinationHash
      ? null
      : {
          ...tx.origin,
          ...destinationSetupInfo,
          status: TransactionStatusEnum.PENDING,
          created: Date.now(),
          hash: destinationHash,
        }
  }
}
