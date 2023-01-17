import { ConnectorBaseEnum, TxListenerTypeEnum } from '@pragma-web-utils/core'
import {
  ListenersInfo,
  MultichainTransaction,
  PartialTx,
  Transaction,
  Tx,
  TxListener,
  TxListenerSubscription,
} from '../types'
import { isMultichainTx, isPartialMultichainTx } from '../utils'

export class TxStorage {
  protected _store: Map<string, Tx> = new Map<string, Tx>()
  protected _listeners: ListenersInfo = {
    [TxListenerTypeEnum.ON_ADD_TX]: new Set<TxListener<TxListenerTypeEnum.ON_ADD_TX>>(),
    [TxListenerTypeEnum.ON_UPDATE_TX]: new Set<TxListener<TxListenerTypeEnum.ON_UPDATE_TX>>(),
    [TxListenerTypeEnum.ON_REMOVE_TX]: new Set<TxListener<TxListenerTypeEnum.ON_REMOVE_TX>>(),
    [TxListenerTypeEnum.ON_LIST_CHANGES]: new Set<TxListener<TxListenerTypeEnum.ON_LIST_CHANGES>>(),
  }

  constructor(_store: Tx[] = []) {
    _store.forEach((tx) => {
      const _clonedTx = this._cloneTx(tx)
      this._store.set(tx.id, _clonedTx)
      if (isMultichainTx(tx) && !!tx.destination) {
        this._store.set(tx.destination.id, _clonedTx)
      }
    })
  }

  public static makeTxId(hashOrCreated: string | number, chainId: string | number, base: ConnectorBaseEnum): Tx['id'] {
    return `${base}_${chainId}_${hashOrCreated}`
  }

  getTxList(filter?: (tx: Tx) => boolean): Tx[] {
    return Array.from(this._store.entries())
      .filter(([id, tx]) => tx.id === id) // remove destination tx links
      .map(([, tx]) => tx)
      .filter(filter ?? (() => true))
  }

  getTx(id: Tx['id']): Tx | undefined {
    const tx = this._store.get(id)
    return tx && this._cloneTx(tx)
  }

  addTx(tx: Tx): boolean {
    const stored = this._store.get(tx.id)
    if (!stored) {
      const _clonedTx = this._cloneTx(tx)
      this._store.set(tx.id, _clonedTx)
      if (isMultichainTx(tx) && !!tx.destination) {
        this._store.set(tx.destination.id, _clonedTx)
      }
      this._onAddTx(tx)
    }
    return !stored
  }

  addDestinationTransaction(id: Tx['id'], destinationTx: Transaction): Tx | undefined {
    const stored = this._store.get(id)
    if (!!stored && isMultichainTx(stored) && !stored.destination) {
      const _clonedTx = this._cloneTx({ ...stored, destination: destinationTx })
      this._store.set(id, _clonedTx)
      this._store.set(destinationTx.id, _clonedTx)
      this._onUpdateTx(_clonedTx, stored)
    }
    return stored
  }

  updateTx(id: Tx['id'], updatedFields: PartialTx): boolean {
    const stored = this._store.get(id)

    if (!!stored) {
      const _updatedTx = isMultichainTx(stored)
        ? this._getUpdatedMultichainTx(stored, updatedFields)
        : this._getUpdatedTx(stored, updatedFields)
      const _clonedTx = this._cloneTx(_updatedTx)
      this._store.set(id, _clonedTx)
      if (isMultichainTx(_clonedTx) && !!_clonedTx.destination) {
        this._store.set(_clonedTx.destination.id, _clonedTx)
      }
      this._onUpdateTx(_clonedTx, stored)
    }

    return !!stored
  }

  removeTx(id: Tx['id']): Tx | null {
    const removed = this._store.get(id)
    if (!removed) {
      return null
    }
    // you can provide tx.destination.id, for remove both id, remove origin id (root id) and destination id
    this._store.delete(removed.id)
    if (isMultichainTx(removed) && !!removed.destination) {
      this._store.delete(removed.destination.id)
    }
    this._onRemoveTx(removed)
    return removed
  }

  addListener<T extends TxListenerTypeEnum>(
    type: T,
    onEvent: TxListener<T>['onEvent'],
    filter?: TxListener<T>['filter'],
  ): TxListenerSubscription {
    const _set = this._listeners[type] as Set<TxListener<T>>
    const newListener: TxListener<T> = {
      type,
      onEvent,
      filter,
      subscription: { unsubscribe: () => _set.delete(newListener) },
    }
    _set.add(newListener)
    return newListener.subscription
  }

  protected _getUpdatedMultichainTx(tx: MultichainTransaction, updatedFields: PartialTx): MultichainTransaction {
    if (!isPartialMultichainTx(updatedFields)) {
      throw 'Wrong update field structure: stored tx in multichain tx, provided updates relate for usual transaction'
    }
    return {
      ...tx,
      ...updatedFields,
      origin: { ...tx.origin, ...updatedFields.origin },
      // ignore destination update if it undefined yet
      destination: !tx.destination ? tx.destination : { ...tx.destination, ...updatedFields.destination },
    }
  }

  protected _getUpdatedTx(
    tx: Exclude<Tx, MultichainTransaction>,
    updatedFields: PartialTx,
  ): Exclude<Tx, MultichainTransaction> {
    if (isPartialMultichainTx(updatedFields)) {
      throw 'Wrong update field structure: stored tx in usual tx, provided updates relate for multichain transaction'
    }
    return { ...tx, ...updatedFields, id: tx.id } as Exclude<Tx, MultichainTransaction>
  }

  protected _onListChanges(): void {
    this._listeners[TxListenerTypeEnum.ON_LIST_CHANGES].forEach((listener) => {
      listener.onEvent(this.getTxList(listener.filter))
    })
  }

  protected _onAddTx(tx: Tx): void {
    this._listeners[TxListenerTypeEnum.ON_ADD_TX].forEach((listener) => {
      if (!listener.filter || listener.filter(tx)) {
        listener.onEvent(tx)
      }
    })
    this._onListChanges()
  }

  protected _onUpdateTx(tx: Tx, oldTx: Tx): void {
    this._listeners[TxListenerTypeEnum.ON_UPDATE_TX].forEach((listener) => {
      if (!listener.filter || listener.filter(tx) || listener.filter(oldTx)) {
        listener.onEvent({ oldValue: oldTx, newValue: tx })
      }
    })
    this._onListChanges()
  }

  protected _onRemoveTx(tx: Tx): void {
    this._listeners[TxListenerTypeEnum.ON_REMOVE_TX].forEach((listener) => {
      if (!listener.filter || listener.filter(tx)) {
        listener.onEvent(tx)
      }
    })
    this._onListChanges()
  }

  protected _cloneTx(tx: Tx): Tx {
    return structuredClone(tx) // TODO: check it in wallet apps dApp browser or return wrapped in Proxy
  }
}
