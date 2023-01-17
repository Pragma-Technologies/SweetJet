import { ConnectorBaseEnum, TransactionStatusEnum, TxListenerTypeEnum } from '../enums'

export type TransactionApp = 'Tron' | 'Web3'
export type Tx = RequestedTransaction | Transaction | MultichainTransaction
export type PartialTx = Partial<RequestedTransaction> | Partial<Transaction> | PartialMultichainTransaction

export type Payload<Action extends string = string> = {
  action: Action
} & {
  [key in string]: unknown // action: string
}

export interface TransactionLike<P = Payload> {
  readonly id: string
  account: string
  chainId: string | number
  created: number
  payload: P
  base: ConnectorBaseEnum
}

export interface Transaction<P = Payload> extends TransactionLike<P> {
  readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`
  hash: string
  status: TransactionStatusEnum
}

export interface RequestedTransaction<P = Payload> extends TransactionLike<P> {
  // `${base}_${chainId}_${created}`
  readonly id: `${ConnectorBaseEnum}_${string | number}_${number}`
}

export interface MultichainTransaction<Origin = Payload, Destination = Payload> {
  // repeat origin.id value
  readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`
  origin: Transaction<Origin>
  destination?: Transaction<Destination>
  destinationChainId: string | number
  destinationBase: ConnectorBaseEnum
}

export interface PartialMultichainTransaction<Origin = Payload, Destination = Payload> {
  origin?: Partial<Transaction<Origin>>
  destination?: Partial<Transaction<Destination>>
}

export interface PartialMultichainTransaction<Origin = Payload, Destination = Payload> {
  origin?: Partial<Transaction<Origin>>
  destination?: Partial<Transaction<Destination>>
}

export interface MultichainOriginInfoCore {
  hash: string
  chainId: string | number
  base: ConnectorBaseEnum
}

export interface MultichainDestinationInfoCore {
  chainId: string | number
  base: ConnectorBaseEnum
}

export type GetDestinationTransactionHash = (
  origin: MultichainOriginInfoCore,
  destination: MultichainDestinationInfoCore,
) => Promise<string | null>

export interface EthNetworkInfo {
  chainId: string | number
  rpcUrl: string
  base: ConnectorBaseEnum.EVM
}

export interface TronNetworkInfo {
  chainId: string | number
  grpcUrl: string
  base: ConnectorBaseEnum.TVM
}

export interface WaitTxStatusOptions {
  waitConfirmations?: number
  waitTimeout?: number
}

export interface TxListener<T extends TxListenerTypeEnum> {
  type: T
  filter?: (tx: Tx) => boolean
  onEvent: (info: TxListenerEventInfo<T>) => void
  subscription: TxListenerSubscription
}

export type TxListenerEventInfo<T extends TxListenerTypeEnum> = T extends TxListenerTypeEnum.ON_LIST_CHANGES
  ? Tx[]
  : T extends TxListenerTypeEnum.ON_UPDATE_TX
  ? { oldValue: Tx; newValue: Tx }
  : Tx

export interface TxListenerSubscription {
  unsubscribe: () => void
}

export type ListenersInfo = {
  [key in TxListenerTypeEnum]: Set<TxListener<key>>
}
