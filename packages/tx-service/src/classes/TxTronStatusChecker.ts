import { wait } from '@pragma-web-utils/core'
import { pendingStatuses } from '../core'
import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo, WaitTxStatusOptions } from '../types'
import { getTxStatus } from '../utils'
import { TxStatusChecker } from './TxStatusChecker'

export class TronTxStatusChecker extends TxStatusChecker {
  constructor(protected _chainId: string | number, protected _grpcUrl: string) {
    super()
  }

  async checkStatus(tx: TxCheckInfo): Promise<TransactionStatusEnum | undefined> {
    if (tx.chainId !== this._chainId) {
      console.warn('Unsupported chainId for check status of tx:', tx)
      return tx.status
    }

    try {
      return (await getTxStatus(this._grpcUrl, tx.hash)) ?? tx.status ?? TransactionStatusEnum.UNKNOWN
    } catch (e) {
      return TransactionStatusEnum.UNKNOWN
    }
  }

  async waitStatus(tx: TxCheckInfo, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum | undefined> {
    if (tx.chainId !== this._chainId) {
      console.warn('Unsupported chainId for check status of tx:', tx)
      return tx.status
    }
    const startTimestamp = Date.now()
    let status = await this.checkStatus(tx)
    let isWaitTransactionTimeoutExpired = !!options?.waitTimeout && Date.now() - startTimestamp < options?.waitTimeout
    while (pendingStatuses.has(status) && isWaitTransactionTimeoutExpired) {
      await wait(30_000)
      status = await this.checkStatus(tx)
      isWaitTransactionTimeoutExpired = !!options?.waitTimeout && Date.now() - startTimestamp < options?.waitTimeout
    }
    return status
  }
}
