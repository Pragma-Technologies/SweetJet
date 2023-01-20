import { ConnectorBaseEnum } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'

type Chain = string | number
export type Tx = RequestedTransaction | Transaction | MultichainTransaction

export type Payload<Action extends string = string> = { action: Action } & { [key in string]: unknown }

export interface TransactionLike<C extends Chain = Chain, P = Payload> {
  readonly id: string
  readonly account: string
  readonly chainId: C
  readonly created: number
  readonly payload: P
  readonly base: ConnectorBaseEnum
}

export interface Transaction<C extends Chain = Chain, P extends Payload = Payload> extends TransactionLike<C, P> {
  // `${base}_${chainId}_${hash}`
  readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`
  readonly hash: string
  status: TransactionStatusEnum
}

export interface RequestedTransaction<C extends Chain = Chain, P extends Payload = Payload>
  extends TransactionLike<C, P> {
  // `${base}_${chainId}_${created}`
  readonly id: `${ConnectorBaseEnum}_${string | number}_${number}`
}

export interface MultichainTransaction<
  OriginChain extends Chain = Chain,
  DestinationChain extends Chain = Chain,
  P extends Payload = Payload,
> extends Transaction<OriginChain, P> {
  // `${base}_${chainId}_${hash}` (all values relate to origin transaction)
  readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`
  readonly destination: {
    hash?: string
    created?: number
    status: TransactionStatusEnum
    readonly chainId: DestinationChain
    readonly base: ConnectorBaseEnum
  }
}

export type TxRequestedInfo<C extends Chain = Chain, P extends Payload = Payload> = {
  account: string
  chainId: C
  base: ConnectorBaseEnum
  payload: P
}

export type TxInfo<C extends Chain = Chain, P extends Payload = Payload> = {
  account: string
  chainId: C
  base: ConnectorBaseEnum
  payload: P
  hash: string
  status?: TransactionStatusEnum
}

export type MultichainTxInfo<
  OriginChain extends string | number = string | number,
  DestinationChain extends string | number = string | number,
  P extends Payload = Payload,
> = {
  account: string
  chainId: OriginChain
  base: ConnectorBaseEnum
  payload: P
  hash: string
  status?: TransactionStatusEnum
  destination:
    | {
        chainId: DestinationChain
        base: ConnectorBaseEnum
      }
    | {
        hash: string
        created: number
        status: TransactionStatusEnum
        chainId: DestinationChain
        base: ConnectorBaseEnum
      }
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
