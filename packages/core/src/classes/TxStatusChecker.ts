import { Transaction, TransactionStatusEnum, WaitTxStatusOptions } from '../../../types/dist'

export abstract class TxStatusChecker {
  abstract checkStatus(tx: Transaction): Promise<TransactionStatusEnum>

  abstract waitStatus(tx: Transaction, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum>
}
