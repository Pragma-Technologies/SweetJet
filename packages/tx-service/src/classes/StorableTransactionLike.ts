import { IStorable, StorageManager } from '@pragma-web-utils/core'
import { Payload, TransactionLike } from '../types'

export class StorableTransactionLike<
  C extends string | number = string | number,
  P extends Payload = Payload,
  Tx extends TransactionLike<C, P> = TransactionLike<C, P>,
> implements IStorable<Tx>
{
  protected _storageManager?: StorageManager<IStorable<Tx>>

  constructor(protected _dto: Tx) {}

  addToStorage(storageManager: StorageManager<IStorable<Tx>>): void {
    this._storageManager = storageManager
  }

  removeFromStorage(): void {
    this._storageManager = undefined
  }

  getId(): string {
    return this._dto.id
  }

  getValue(): Tx {
    return this._dto
  }

  protected _updateStoreValue(value: IStorable<Tx>): void {
    this._storageManager?.updateItem(this.getId(), value)
  }
}
