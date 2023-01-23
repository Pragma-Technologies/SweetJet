import { RequestDelayUtils, wait } from '@pragma-web-utils/core'
import { pendingStatuses } from '../core'
import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo, WaitTxStatusOptions } from '../types'
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
      const body = JSON.stringify({ value: tx.hash })
      await RequestDelayUtils.addDelay()
      const response = await fetch(`${this._grpcUrl}walletsolidity/gettransactionbyid`, { method: 'POST', body })

      const res = await response.json()
      const status = res?.ret && res.ret[0]?.contractRet
      switch (status) {
        case 'SUCCESS':
          return TransactionStatusEnum.SUCCESS
        case 'REVERT':
          return TransactionStatusEnum.FAILED
        default:
          return tx.status ?? TransactionStatusEnum.UNKNOWN
      }
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
