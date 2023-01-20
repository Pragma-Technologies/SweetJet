import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo } from '../types'
import { TronTxStatusChecker } from './TxTronStatusChecker'

type TronReceipt = {
  ret?: [{ contractRet: 'SUCCESS' | 'REVERT' | string }]
}
type Fetch = jest.SpyInstance<Promise<Response>, [url: RequestInfo | URL, init?: RequestInit | undefined]>
const emptyReceipt: TronReceipt = {
  ret: [{ contractRet: 'SUCCESS' }],
}
const txInfo: TxCheckInfo = { status: TransactionStatusEnum.UNKNOWN, hash: 'hash', chainId: 1 }
let _fetch: Fetch
const grpc = 'grpc_'
const url = 'grpc_walletsolidity/gettransactionbyid'
describe('TronTxStatusChecker', () => {
  beforeEach(() => {
    _fetch?.mockReset()
    _fetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(async () => ({ json: async () => emptyReceipt } as Response)) as Fetch
  })
  it('checkStatus', async () => {
    const checker = new TronTxStatusChecker(1, grpc)

    const status = await checker.checkStatus(txInfo)
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(url, { body: '{"value":"hash"}', method: 'POST' })
  })
  // TODO: add waited transaction for check calling fetch few times
  it('waitStatus', async () => {
    const checker = new TronTxStatusChecker(1, grpc)

    const status = await checker.waitStatus(txInfo, { waitTimeout: 300, waitConfirmations: 12 })
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(url, { body: '{"value":"hash"}', method: 'POST' })
  })
})
