import { ConnectorBaseEnum } from '../enums/ConnectorBaseEnum';
import { TransactionStatusEnum } from '../enums/TransactionStatusEnum';
import { MultichainDestinationInfoCore, MultichainOriginInfoCore, MultichainTransaction, PartialMultichainTransaction } from './TransactionMultichain';
import { RequestedTransaction } from './TransactionRequested';
export type Tx = RequestedTransaction | Transaction | MultichainTransaction;
export type PartialTx = Partial<RequestedTransaction> | Partial<Transaction> | PartialMultichainTransaction;
export type Payload<Action extends string = string> = {
    action: Action;
} & {
    [key in string]: unknown;
};
export interface TransactionLike<P = Payload> {
    readonly id: string;
    account: string;
    chainId: string | number;
    created: number;
    payload: P;
    base: ConnectorBaseEnum;
}
export interface Transaction<P = Payload> extends TransactionLike<P> {
    readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`;
    hash: string;
    status: TransactionStatusEnum;
}
export interface EthNetworkInfo {
    chainId: string | number;
    rpcUrl: string;
    base: ConnectorBaseEnum.EVM;
}
export interface TronNetworkInfo {
    chainId: string | number;
    grpcUrl: string;
    base: ConnectorBaseEnum.TVM;
}
export type GetDestinationTransactionHash = (origin: MultichainOriginInfoCore, destination: MultichainDestinationInfoCore) => Promise<string | null>;
export interface WaitTxStatusOptions {
    waitConfirmations?: number;
    waitTimeout?: number;
}
