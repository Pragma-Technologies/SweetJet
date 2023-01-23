import { IStorable, StorableValue, StorageListenerTypeEnum, TStorageListenerEventInfo } from '@pragma-web-utils/core'
import { TransactionLike } from '../types'

export function getUnwrapStorageListenerEventInfo<
  T extends StorageListenerTypeEnum,
  Tx extends IStorable<TransactionLike>,
>(type: T, info: TStorageListenerEventInfo<T, Tx>): TStorageListenerEventInfo<T, StorableValue<Tx>> {
  switch (type) {
    case StorageListenerTypeEnum.ON_LIST_CHANGES:
      const list = info as TStorageListenerEventInfo<StorageListenerTypeEnum.ON_LIST_CHANGES, Tx>
      return list.map((tx) => tx.getValue()) as TStorageListenerEventInfo<T, StorableValue<Tx>>
    case StorageListenerTypeEnum.ON_UPDATE:
      const { oldValue, newValue } = info as TStorageListenerEventInfo<StorageListenerTypeEnum.ON_UPDATE, Tx>
      return {
        oldValue: oldValue.getValue(),
        newValue: newValue.getValue(),
      } as TStorageListenerEventInfo<T, StorableValue<Tx>>
    case StorageListenerTypeEnum.ON_ADD:
    case StorageListenerTypeEnum.ON_REMOVE:
    default:
      return (info as Tx).getValue() as TStorageListenerEventInfo<T, StorableValue<Tx>>
  }
}
