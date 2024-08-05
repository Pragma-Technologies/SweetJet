import { ConnectorBaseEnum } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'

export type Chain = number
export type Payload<Action extends string = string> = { action: Action } & { [key in string]: unknown }
export type DestinationPayload<Action extends string = string> = Payload<Action> & { destinationTxIndex: number }
export type DestinationIndexPayload<P extends Payload = Payload> = P & { destinationTxIndex: number }
export type Tx<C extends Chain = Chain, P extends Payload = Payload> = RequestedTransaction<C, P> | Transaction<C, P>

export type PayloadAction<T extends Payload> = T extends Payload<infer Action> ? Action : never
export type TransactionChain<T extends TransactionLike> = T extends TransactionLike<infer C> ? C : never
export type TransactionPayload<T extends TransactionLike> = T extends TransactionLike<Chain, infer P> ? P : never

export interface TransactionLike<C extends Chain = Chain, P extends Payload = Payload> {
  readonly id: string
  readonly account: string
  readonly chainId: C
  readonly created: number
  readonly payload: P
  readonly base: ConnectorBaseEnum
}

export interface Transaction<C extends Chain = Chain, P extends Payload = Payload> extends TransactionLike<C, P> {
  // `${base}_${chainId}_${hash}`
  readonly id: `${ConnectorBaseEnum}_${C}_${string}`
  readonly hash: string
  status: TransactionStatusEnum
  nextTx?: Transaction<C, DestinationIndexPayload<P>>
}

export interface RequestedTransaction<C extends Chain = Chain, P extends Payload = Payload>
  extends TransactionLike<C, P> {
  // `${base}_${chainId}_${created}`
  readonly id: `${ConnectorBaseEnum}_${C}_${number}`
}

export type TxRequestedInfo<C extends Chain = Chain, P extends Payload = Payload> = {
  account: string
  chainId: C
  base: ConnectorBaseEnum
  payload: P
  created?: number
}

export type TxInfo<C extends Chain = Chain, P extends Payload = Payload> = {
  account: string
  chainId: C
  base: ConnectorBaseEnum
  payload: P
  hash: string
  status?: TransactionStatusEnum
  created?: number
  nextTx?: TxInfo<C, P>
}

export type TxCheckInfo<C extends Chain = Chain> = {
  chainId: C
  hash: string
  status?: TransactionStatusEnum
}

export interface WaitTxStatusOptions {
  waitConfirmations?: number
  waitTimeout?: number
}
