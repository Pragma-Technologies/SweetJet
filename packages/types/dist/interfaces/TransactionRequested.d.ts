import { ConnectorBaseEnum } from '../enums/ConnectorBaseEnum';
import { Payload, TransactionLike } from './Transaction';
export interface RequestedTransaction<P = Payload> extends TransactionLike<P> {
    readonly id: `${ConnectorBaseEnum}_${string | number}_${number}`;
}
