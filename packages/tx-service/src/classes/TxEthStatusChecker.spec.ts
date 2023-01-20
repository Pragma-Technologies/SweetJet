import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { BigNumber, ethers } from 'ethers'
import { TransactionStatusEnum } from '../enums'
import { TxCheckInfo } from '../types'
import { EthTxStatusChecker } from './TxEthStatusChecker'

const emptyReceipt: TransactionReceipt = {
  from: '',
  status: 1,
  type: 2,
  blockHash: '',
  confirmations: 1,
  blockNumber: 1,
  byzantium: true,
  contractAddress: '',
  cumulativeGasUsed: BigNumber.from(0),
  effectiveGasPrice: BigNumber.from(0),
  logs: [],
  gasUsed: BigNumber.from(0),
  logsBloom: '',
  root: '',
  to: '',
  transactionHash: '',
  transactionIndex: 1,
}
const txInfo: TxCheckInfo = { status: TransactionStatusEnum.UNKNOWN, hash: 'hash', chainId: 1 }

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/', 1)
let _provider = jest.spyOn(ethers.providers, 'JsonRpcProvider').mockImplementation(() => provider)
let checkStatus = jest.spyOn(provider, 'getTransactionReceipt').mockImplementation(async () => emptyReceipt)
let waitStatus = jest.spyOn(provider, 'waitForTransaction').mockImplementation(async () => emptyReceipt)
describe('EthTxStatusChecker', () => {
  beforeEach(() => {
    checkStatus.mockReset()
    waitStatus?.mockReset()
    _provider.mockReset()
    checkStatus = jest.spyOn(provider, 'getTransactionReceipt').mockImplementation(async () => emptyReceipt)
    waitStatus = jest.spyOn(provider, 'waitForTransaction').mockImplementation(async () => emptyReceipt)
    _provider = jest.spyOn(ethers.providers, 'JsonRpcProvider').mockImplementation(() => provider)
  })
  it('checkStatus', async () => {
    const checker = new EthTxStatusChecker(1, 'https://mainnet.infura.io/v3/')

    const status = await checker.checkStatus(txInfo)
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(checkStatus).toBeCalledTimes(1)
    expect(checkStatus).toBeCalledWith('hash')
  })
  it('waitStatus', async () => {
    const checker = new EthTxStatusChecker(1, 'https://mainnet.infura.io/v3/')

    const status = await checker.waitStatus(txInfo, { waitTimeout: 300, waitConfirmations: 12 })
    expect(status).toBe(TransactionStatusEnum.SUCCESS)
    expect(waitStatus).toBeCalledTimes(1)
    expect(waitStatus).toBeCalledWith('hash', 12, 300)
  })
})
