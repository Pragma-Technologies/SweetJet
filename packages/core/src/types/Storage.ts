import { StorageManager } from '../classes'
import { StorageListenerTypeEnum } from '../enums'

export interface IStorageListener<T extends StorageListenerTypeEnum, S = unknown> {
  type: T
  filter?: (tx: S) => boolean
  onEvent: (info: TStorageListenerEventInfo<T, S>) => void
  subscription: IStorageSubscription
}

export type TStorageListenersInfo<S = unknown> = {
  [key in StorageListenerTypeEnum]: Set<IStorageListener<key, S>>
}

export type TStorageListenerEventInfo<
  T extends StorageListenerTypeEnum,
  S = unknown,
> = T extends StorageListenerTypeEnum.ON_LIST_CHANGES
  ? S[]
  : T extends StorageListenerTypeEnum.ON_UPDATE
  ? { oldValue: S; newValue: S }
  : S

export interface IStorageSubscription {
  unsubscribe: () => void
}

export interface IStorage<D = unknown> {
  getId: (item: D) => string
  hasItem: (id: string) => boolean
  getItem: (id: string) => D | undefined
  getItems: () => D[]
  addItem: (item: D) => string | undefined
  updateItem: (id: string, newItem: D) => boolean
  removeItem: (id: string) => D | undefined
}

export interface IStorable<T = unknown> {
  getId(): string
  getValue(): T
  // TODO: try another type of communication between store manager and storable
  addToStorage(storageManager: StorageManager<T>): void
  removeFromStorage(): void
}
