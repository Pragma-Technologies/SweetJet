import { TransactionStatusEnum } from '../enums'
import { Transaction, WaitTxStatusOptions } from '../types'

export abstract class TxStatusChecker {
  abstract checkStatus(tx: Transaction): Promise<TransactionStatusEnum>

  abstract waitStatus(tx: Transaction, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum>
}
