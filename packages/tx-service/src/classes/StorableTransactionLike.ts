import { IStorable, StorageManager } from '@pragma-web-utils/core'
import { TransactionLike, Payload } from '../types'

export class StorableTransactionLike<C extends string | number, P extends Payload, Tx extends TransactionLike<C, P>>
  implements IStorable<Tx>
{
  protected constructor(protected _dto: Tx, protected _storageManager: StorageManager<IStorable<Tx>>) {}

  getId(): string {
    return this._dto.id
  }

  getDTO(): Tx {
    return this._dto
  }

  protected _updateStoreValue(): void {
    this._storageManager.updateItem(this.getId(), this)
  }
}
