import { StorageListenerTypeEnum } from '../enums'
import { IStorable, IStorageListener, IStorageSubscription, TStorageListenersInfo } from '../types'

export class StorageManager<T = unknown, D extends IStorable<T> = IStorable<T>> {
  protected _store: Map<string, D> = new Map<string, D>()
  // TODO: rollback to TStorageListenersInfo<D>
  protected _listeners: TStorageListenersInfo<IStorable<T>> = {
    [StorageListenerTypeEnum.ON_ADD]: new Set<IStorageListener<StorageListenerTypeEnum.ON_ADD, IStorable<T>>>(),
    [StorageListenerTypeEnum.ON_UPDATE]: new Set<IStorageListener<StorageListenerTypeEnum.ON_UPDATE, IStorable<T>>>(),
    [StorageListenerTypeEnum.ON_REMOVE]: new Set<IStorageListener<StorageListenerTypeEnum.ON_REMOVE, IStorable<T>>>(),
    [StorageListenerTypeEnum.ON_LIST_CHANGES]: new Set<
      IStorageListener<StorageListenerTypeEnum.ON_LIST_CHANGES, IStorable<T>>
    >(),
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
    if (this.hasItem(id)) {
      return undefined
    }
    this._store.set(id, item)
    item.addToStorage(this)
    this._onAddItem(item)
    return id
  }

  updateItem(id: string, newItem: D): boolean {
    const oldItem = this.getItem(id)

    if (!oldItem) {
      return false
    }

    this._store.set(id, newItem)
    if (newItem !== oldItem) {
      oldItem.removeFromStorage()
      newItem.addToStorage(this)
    }
    this._onUpdateItem(newItem, oldItem)
    return true
  }

  removeItem(id: string): D | undefined {
    const removed = this.getItem(id)

    if (!!removed) {
      this._store.delete(id)
      removed.removeFromStorage()
      this._onRemoveItem(removed)
      return removed
    }

    return undefined
  }

  // TODO: rollback IStorable<T> to D
  addListener<L extends StorageListenerTypeEnum>(
    type: L,
    onEvent: IStorageListener<L, IStorable<T>>['onEvent'],
    filter?: IStorageListener<L, IStorable<T>>['filter'],
  ): IStorageSubscription {
    const _set = this._listeners[type] as Set<IStorageListener<L, IStorable<T>>>
    const newListener: IStorageListener<L, IStorable<T>> = {
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

  protected _onAddItem(item: D): void {
    this._listeners[StorageListenerTypeEnum.ON_ADD].forEach(
      (listener) => (!listener.filter || listener.filter(item)) && listener.onEvent(item),
    )
    this._onListChanges()
  }

  protected _onUpdateItem(newValue: D, oldValue: D): void {
    this._listeners[StorageListenerTypeEnum.ON_UPDATE].forEach((listener) => {
      const isValid = !listener.filter || listener.filter(newValue) || listener.filter(oldValue)
      isValid && listener.onEvent({ oldValue: oldValue, newValue: newValue })
    })
    this._onListChanges()
  }

  protected _onRemoveItem(item: D): void {
    this._listeners[StorageListenerTypeEnum.ON_REMOVE].forEach((listener) => {
      ;(!listener.filter || listener.filter(item)) && listener.onEvent(item)
    })
    this._onListChanges()
  }
}
