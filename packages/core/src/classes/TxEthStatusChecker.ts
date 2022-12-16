import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { TransactionStatusEnum } from '@pragma-web-utils/types/src/enums/TransactionStatusEnum'
import { Transaction, WaitTxStatusOptions } from '@pragma-web-utils/types/src/interfaces/Transaction'
import { ethers } from 'ethers'
import { TxStatusChecker } from './TxStatusChecker'

export class EthTxStatusChecker extends TxStatusChecker {
  protected _provider: ethers.providers.JsonRpcProvider

  constructor(protected _chainId: string | number, protected _rpcUrl: string) {
    super()
    this._provider = new ethers.providers.JsonRpcProvider(_rpcUrl, +_chainId)
  }

  async checkStatus(tx: Transaction): Promise<TransactionStatusEnum> {
    if (tx.chainId !== this._chainId) {
      console.warn('Unsupported chainId for check status of tx:', tx)
      return tx.status
    }
    const receipt = await this._provider.getTransactionReceipt(tx.hash)
    return this._getStatusByTxReceipt(receipt)
  }

  async waitStatus(tx: Transaction, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum> {
    if (tx.chainId !== this._chainId) {
      console.warn('Unsupported chainId for check status of tx:', tx)
      return tx.status
    }
    const receipt = await this._provider.waitForTransaction(tx.hash, options?.waitConfirmations, options?.waitTimeout)
    return this._getStatusByTxReceipt(receipt)
  }

  private _getStatusByTxReceipt(receipt: TransactionReceipt | null): TransactionStatusEnum {
    switch (receipt?.status) {
      case 1:
        return TransactionStatusEnum.SUCCESS
      case 0:
        return TransactionStatusEnum.FAILED
      default:
        return TransactionStatusEnum.UNKNOWN
    }
  }
}
