import { StorageListenerTypeEnum } from '../enums'
import { IStorable, IStorageListener, IStorageSubscription, TStorageListenersInfo } from '../types'

export class StorageManager<D extends IStorable = IStorable> {
  protected _store: Map<string, D> = new Map<string, D>()
  protected _listeners: TStorageListenersInfo<D> = {
    [StorageListenerTypeEnum.ON_ADD]: new Set<IStorageListener<StorageListenerTypeEnum.ON_ADD, D>>(),
    [StorageListenerTypeEnum.ON_UPDATE]: new Set<IStorageListener<StorageListenerTypeEnum.ON_UPDATE, D>>(),
    [StorageListenerTypeEnum.ON_REMOVE]: new Set<IStorageListener<StorageListenerTypeEnum.ON_REMOVE, D>>(),
    [StorageListenerTypeEnum.ON_LIST_CHANGES]: new Set<IStorageListener<StorageListenerTypeEnum.ON_LIST_CHANGES, D>>(),
  }

  constructor(_store: D[] = []) {
    _store.forEach((item) => this.addItem(item))
  }

  getStoredList(filter?: (item: D) => boolean): D[] {
    const items = [...this._store.values()]
    return filter ? items.filter(filter) : items
  }

  getItem(id: string): D | undefined {
    return this._store.get(id)
  }

  hasItem(id: string): boolean {
    return this._store.has(id)
  }

  addItem(item: D): string | undefined {
    const id = item.getId()
    if (!this.hasItem(id)) {
      return undefined
    }
    this._store.set(id, item)
    this._onAddTx(item)
    return id
  }

  updateItem(id: string, newItem: D): boolean {
    const oldItem = this.getItem(id)

    if (!!oldItem) {
      this._store.set(id, newItem)
      this._onUpdateTx(newItem, oldItem)
      return true
    }

    return false
  }

  removeTx(id: string): D | undefined {
    const removed = this.getItem(id)

    if (!!removed) {
      this._store.delete(id)
      this._onRemoveTx(removed)
      return removed
    }

    return undefined
  }

  addListener<T extends StorageListenerTypeEnum>(
    type: T,
    onEvent: IStorageListener<T, D>['onEvent'],
    filter?: IStorageListener<T, D>['filter'],
  ): IStorageSubscription {
    const _set = this._listeners[type] as Set<IStorageListener<T, D>>
    const newListener: IStorageListener<T, D> = {
      type,
      onEvent,
      filter,
      subscription: { unsubscribe: () => _set.delete(newListener) },
    }
    _set.add(newListener)
    return newListener.subscription
  }

  protected _onListChanges(): void {
    this._listeners[StorageListenerTypeEnum.ON_LIST_CHANGES].forEach((listener) =>
      listener.onEvent(this.getStoredList(listener.filter)),
    )
  }

  protected _onAddTx(item: D): void {
    this._listeners[StorageListenerTypeEnum.ON_ADD].forEach(
      (listener) => (!listener.filter || listener.filter(item)) && listener.onEvent(item),
    )
    this._onListChanges()
  }

  protected _onUpdateTx(newValue: D, oldValue: D): void {
    this._listeners[StorageListenerTypeEnum.ON_UPDATE].forEach((listener) => {
      const isValid = !listener.filter || listener.filter(newValue) || listener.filter(oldValue)
      isValid && listener.onEvent({ oldValue: oldValue, newValue: newValue })
    })
    this._onListChanges()
  }

  protected _onRemoveTx(item: D): void {
    this._listeners[StorageListenerTypeEnum.ON_REMOVE].forEach((listener) => {
      ;(!listener.filter || listener.filter(item)) && listener.onEvent(item)
    })
    this._onListChanges()
  }
}
