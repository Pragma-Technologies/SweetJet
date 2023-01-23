import { TxStatusChecker } from '../classes/TxStatusChecker'
import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo, WaitTxStatusOptions } from '../types'

export class TestTxChecker extends TxStatusChecker {
  async checkStatus(tx: TxCheckInfo): Promise<TransactionStatusEnum | undefined> {
    return TransactionStatusEnum.SUCCESS
  }

  async waitStatus(tx: TxCheckInfo, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum | undefined> {
    return TransactionStatusEnum.SUCCESS
  }
}
