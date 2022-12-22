import { ConnectorBaseEnum } from '../enums/ConnectorBaseEnum';
import { Payload, Transaction } from './Transaction';
export interface MultichainTransaction<Origin = Payload, Destination = Payload> {
    readonly id: `${ConnectorBaseEnum}_${string | number}_${string}`;
    origin: Transaction<Origin>;
    destination?: Transaction<Destination>;
    destinationChainId: string | number;
    destinationBase: ConnectorBaseEnum;
}
export interface MultichainDestinationInfoCore {
    chainId: string | number;
    base: ConnectorBaseEnum;
}
export interface MultichainOriginInfoCore {
    hash: string;
    chainId: string | number;
    base: ConnectorBaseEnum;
}
export interface PartialMultichainTransaction<Origin = Payload, Destination = Payload> {
    origin?: Partial<Transaction<Origin>>;
    destination?: Partial<Transaction<Destination>>;
}
