import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo } from '../types'
import * as GetTxStatusUtils from '../utils/getTxStatus'
import { TronTxStatusChecker } from './TxTronStatusChecker'

type Fetch = jest.SpyInstance<Promise<TransactionStatusEnum | undefined>, [grpcUrl: string, hash: string]>

const txInfo: TxCheckInfo = { status: TransactionStatusEnum.UNKNOWN, hash: 'hash', chainId: 1 }
let _fetch: Fetch
const grpc = 'grpc_'

describe('TronTxStatusChecker', () => {
  beforeEach(() => {
    _fetch?.mockReset()
    _fetch = jest.spyOn(GetTxStatusUtils, 'getTxStatus').mockImplementation(async () => TransactionStatusEnum.SUCCESS)
  })
  it('checkStatus', async () => {
    const checker = new TronTxStatusChecker(1, grpc)

    const status = await checker.checkStatus(txInfo)
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(grpc, 'hash')
  })
  // TODO: add waited transaction for check calling fetch few times
  it('waitStatus', async () => {
    const checker = new TronTxStatusChecker(1, grpc)

    const status = await checker.waitStatus(txInfo, { waitTimeout: 300, waitConfirmations: 12 })
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(_fetch).toBeCalledTimes(1)
    expect(_fetch).toBeCalledWith(grpc, 'hash')
  })
})
