import { RequestDelayUtils, wait } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { Transaction, WaitTxStatusOptions } from '../types'
import { TxStatusChecker } from './TxStatusChecker'

const waitingStatuses = new Set([TransactionStatusEnum.UNKNOWN, TransactionStatusEnum.PENDING])

export class TronTxStatusChecker extends TxStatusChecker {
  constructor(protected _chainId: string | number, protected _grpcUrl: string) {
    super()
  }

  async checkStatus(tx: Transaction): Promise<TransactionStatusEnum> {
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
          return TransactionStatusEnum.UNKNOWN
      }
    } catch (e) {
      return TransactionStatusEnum.UNKNOWN
    }
  }

  async waitStatus(tx: Transaction, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum> {
    if (tx.chainId !== this._chainId) {
      console.warn('Unsupported chainId for check status of tx:', tx)
      return tx.status
    }
    const startTimestamp = Date.now()
    let status = await this.checkStatus(tx)
    let isWaitTransactionTimeoutExpired = !!options?.waitTimeout && Date.now() - startTimestamp < options?.waitTimeout
    while (waitingStatuses.has(status) && isWaitTransactionTimeoutExpired) {
      await wait(30_000)
      status = await this.checkStatus(tx)
      isWaitTransactionTimeoutExpired = !!options?.waitTimeout && Date.now() - startTimestamp < options?.waitTimeout
    }
    return status
  }
}
