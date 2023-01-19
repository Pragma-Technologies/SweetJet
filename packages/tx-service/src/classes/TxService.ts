import {
  IStorable,
  IStorageSubscription,
  StorageListenerTypeEnum,
  StorageManager,
  TStorageListenerEventInfo,
} from '@pragma-web-utils/core'
import { TransactionLike, Payload } from '../types'

export class TxService<
  C extends string | number = string | number,
  P extends Payload = Payload,
  Tx extends IStorable<TransactionLike<C, P>> = IStorable<TransactionLike<C, P>>,
> {
  protected _storageManager: StorageManager<Tx> = new StorageManager<Tx>([])

  getList(filter?: (tx: Tx) => boolean): Tx[] {
    return this._storageManager.getStoredList(filter)
  }

  add(...list: Tx[]): void {
    list.forEach((tx) => this._storageManager.addItem(tx))
  }

  remove(id: string): Tx | undefined {
    return this._storageManager.removeTx(id)
  }

  addListener<T extends StorageListenerTypeEnum>(
    type: T,
    onEvent: (info: TStorageListenerEventInfo<T, TransactionLike<C, P>>) => void,
    filter?: (tx: Tx) => boolean,
  ): IStorageSubscription {
    return this._storageManager.addListener(
      type,
      (data) =>
        onEvent(
          (type === StorageListenerTypeEnum.ON_LIST_CHANGES
            ? (data as Tx[]).map((tx) => tx.getDTO())
            : (data as Tx).getDTO()) as TStorageListenerEventInfo<T, TransactionLike<C, P>>,
        ),
      filter,
    )
  }
}
