import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo, WaitTxStatusOptions } from '../types'

export abstract class TxStatusChecker {
  abstract checkStatus(tx: TxCheckInfo): Promise<TransactionStatusEnum | undefined>

  abstract waitStatus(tx: TxCheckInfo, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum | undefined>
}
