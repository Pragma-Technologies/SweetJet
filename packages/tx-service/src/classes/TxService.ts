import {
  IStorable,
  IStorageSubscription,
  StorableValue,
  StorageListenerTypeEnum,
  StorageManager,
  TStorageListenerEventInfo,
} from '@pragma-web-utils/core'
import { TransactionLike } from '../types'

export class TxService<Tx extends IStorable<TransactionLike> = IStorable<TransactionLike>> {
  protected _storageManager: StorageManager<Tx> = new StorageManager<Tx>([])

  getList(filter?: (tx: StorableValue<Tx>) => boolean): StorableValue<Tx>[] {
    return this._storageManager
      .getStoredList(filter && ((data) => filter(data.getValue() as StorableValue<Tx>)))
      .map((item) => item.getValue() as StorableValue<Tx>)
  }

  add(...list: Tx[]): void {
    list.forEach((tx) => this._storageManager.addItem(tx))
  }

  getItem(id: string): Tx | undefined {
    return this._storageManager.getItem(id)
  }

  hasItem(id: string): boolean {
    return this._storageManager.hasItem(id)
  }

  remove(id: string): Tx | undefined {
    return this._storageManager.removeItem(id)
  }

  addListener<T extends StorageListenerTypeEnum>(
    type: T,
    onEvent: (info: TStorageListenerEventInfo<T, StorableValue<Tx>>) => void,
    filter?: (tx: StorableValue<Tx>) => boolean,
  ): IStorageSubscription {
    return this._storageManager.addListener(
      type,
      (data) =>
        onEvent(
          (type === StorageListenerTypeEnum.ON_LIST_CHANGES
            ? (data as Tx[]).map((tx) => tx.getValue())
            : (data as Tx).getValue()) as TStorageListenerEventInfo<T, StorableValue<Tx>>,
        ),
      filter && ((data) => filter(data.getValue() as StorableValue<Tx>)),
    )
  }
}
