import { RequestDelayUtils, TransactionStatusEnum } from '@pragma-web-utils/core'

export const getTxStatus = async (grpcUrl: string, hash: string): Promise<TransactionStatusEnum | undefined> => {
  const body = JSON.stringify({ value: hash })
  await RequestDelayUtils.addDelay()
  const response = await fetch(`${grpcUrl}walletsolidity/gettransactionbyid`, { method: 'POST', body })

  const res = await response.json()
  const status = res?.ret && res.ret[0]?.contractRet
  switch (status) {
    case 'SUCCESS':
      return TransactionStatusEnum.SUCCESS
    case 'REVERT':
      return TransactionStatusEnum.FAILED
    default:
      return undefined
  }
}
