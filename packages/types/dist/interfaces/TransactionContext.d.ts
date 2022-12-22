import { ChainId } from '../enums/ChainId';
import { ConnectorBaseEnum } from '../enums/ConnectorBaseEnum';
import { TxListenerTypeEnum } from '../enums/TxListenerTypeEnum';
import { Payload, Tx } from './Transaction';
import { MultichainDestinationInfoCore } from './TransactionMultichain';
import { TxListener, TxListenerSubscription } from './TxListener';
import { TxService } from './TxService';
export interface TransactionContextProps2 {
    txService: TxService;
    addListener<T extends TxListenerTypeEnum>(type: T, onEvent: TxListener<T>['onEvent'], filter?: TxListener<T>['filter']): TxListenerSubscription;
    addRequestedTransaction(account: string, chainId: ChainId, base: ConnectorBaseEnum, payload: Payload<string>): Tx['id'];
    addTransaction(requestedId: Tx['id'], hash: string, chainId: ChainId, base: ConnectorBaseEnum, destinationInfoCore?: MultichainDestinationInfoCore): void;
    handleTransactionError(error: unknown, base: ConnectorBaseEnum): void;
}
