import { TxListenerTypeEnum } from '../enums/TxListenerTypeEnum';
import { Tx } from './Transaction';
import { TxListenerEventInfo, TxListenerSubscription } from './TxListener';
export interface TxService {
    startUpdater(): void;
    stopUpdater(): void;
    getTransactions(filter?: (tx: Tx) => boolean): Tx[];
    addTransaction(tx: Tx): boolean;
    removeTransaction(id: Tx['id']): Tx | null;
    addListener<T extends TxListenerTypeEnum>(type: T, onEvent: (info: TxListenerEventInfo<T>) => void, filter?: (tx: Tx) => boolean): TxListenerSubscription;
}
