import { TxListenerTypeEnum } from '../enums/TxListenerTypeEnum'
import { PartialTx, Transaction, Tx } from './Transaction'
import { TxListener, TxListenerSubscription } from './TxListener'

export interface TxStorage {
  getTxList(filter?: (tx: Tx) => boolean): Tx[]

  getTx(id: Tx['id']): Tx | undefined

  addTx(tx: Tx): boolean

  addDestinationTransaction(id: Tx['id'], destinationTx: Transaction): Tx | undefined

  updateTx(id: Tx['id'], updatedFields: PartialTx): boolean

  removeTx(id: Tx['id']): Tx | null

  addListener<T extends TxListenerTypeEnum>(
    type: T,
    onEvent: TxListener<T>['onEvent'],
    filter?: TxListener<T>['filter'],
  ): TxListenerSubscription
}
