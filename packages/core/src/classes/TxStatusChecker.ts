import { TransactionStatusEnum } from '@pragma-web-utils/types/src/enums/TransactionStatusEnum'
import { Transaction, WaitTxStatusOptions } from '@pragma-web-utils/types/src/interfaces/Transaction'

export abstract class TxStatusChecker {
  abstract checkStatus(tx: Transaction): Promise<TransactionStatusEnum>

  abstract waitStatus(tx: Transaction, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum>
}
