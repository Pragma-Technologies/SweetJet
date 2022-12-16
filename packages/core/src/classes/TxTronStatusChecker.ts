import { TransactionStatusEnum } from '@pragma-web-utils/types/src/enums/TransactionStatusEnum'
import { Transaction, WaitTxStatusOptions } from '@pragma-web-utils/types/src/interfaces/Transaction'
import { RequestDelayUtils } from './RequestDelayUtils'
import { TxStatusChecker } from './TxStatusChecker'
import { wait } from './Wait'

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
