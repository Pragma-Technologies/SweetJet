import { TxListenerTypeEnum } from '@pragma-web-utils/core'
import {
  EthNetworkInfo,
  GetDestinationTransactionHash,
  TronNetworkInfo,
  Tx,
  TxListenerEventInfo,
  TxListenerSubscription,
} from '../types'
import { TxStorage } from './TxStorage'
import { TxUpdater } from './TxUpdater'

export class TxService {
  protected _storage: TxStorage
  protected _updater: TxUpdater

  constructor(
    _store: Tx[] = [],
    protected _networkInfos: (EthNetworkInfo | TronNetworkInfo)[],
    _getDestinationTransactionHash: GetDestinationTransactionHash,
    protected _waitTimeout = 5 * 60 * 1000,
  ) {
    this._storage = new TxStorage(_store)
    this._updater = new TxUpdater(this._storage, _networkInfos, _getDestinationTransactionHash, _waitTimeout)
  }

  startUpdater(): void {
    this._updater.initListeners()
  }

  stopUpdater(): void {
    this._updater.stopListeners()
  }

  getTransactions(filter?: (tx: Tx) => boolean): Tx[] {
    return this._storage.getTxList(filter)
  }

  addTransaction(tx: Tx): boolean {
    return this._storage.addTx(tx)
  }

  removeTransaction(id: Tx['id']): Tx | null {
    return this._storage.removeTx(id)
  }

  addListener<T extends TxListenerTypeEnum>(
    type: T,
    onEvent: (info: TxListenerEventInfo<T>) => void,
    filter?: (tx: Tx) => boolean,
  ): TxListenerSubscription {
    return this._storage.addListener(type, onEvent, filter)
  }
}
