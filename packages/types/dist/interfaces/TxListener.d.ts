import { TxListenerTypeEnum } from '../enums/TxListenerTypeEnum'
import { Tx } from './Transaction'
export type TxListenerEventInfo<T extends TxListenerTypeEnum> = T extends TxListenerTypeEnum.ON_LIST_CHANGES
  ? Tx[]
  : T extends TxListenerTypeEnum.ON_UPDATE_TX
  ? {
      oldValue: Tx
      newValue: Tx
    }
  : Tx
export interface TxListener<T extends TxListenerTypeEnum> {
  type: T
  filter?: (tx: Tx) => boolean
  onEvent: (info: TxListenerEventInfo<T>) => void
  subscription: TxListenerSubscription
}
export interface TxListenerSubscription {
  unsubscribe: () => void
}
export type ListenersInfo = {
  [key in TxListenerTypeEnum]: Set<TxListener<key>>
}
