import { ConnectorBaseEnum, EMPTY_ADDRESS, IStorable, StorageManager } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { TransactionLike, TxCheckInfo, TxInfo, WaitTxStatusOptions } from '../types'
import { StorableTx } from './StorableTx'
import { TxStatusChecker } from './TxStatusChecker'

const dto: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...',
  status: TransactionStatusEnum.UNKNOWN,
}
const id = `${dto.base}_${dto.chainId}_${dto.hash}`

class TestTxStatusChecker extends TxStatusChecker {
  async checkStatus(tx: TxCheckInfo): Promise<TransactionStatusEnum | undefined> {
    return TransactionStatusEnum.SUCCESS
  }

  async waitStatus(tx: TxCheckInfo, options?: WaitTxStatusOptions): Promise<TransactionStatusEnum | undefined> {
    return TransactionStatusEnum.SUCCESS
  }
}

const testChecker = new TestTxStatusChecker()

describe('StorableTx', () => {
  it('check id', () => {
    const storable = new StorableTx(dto, testChecker)
    expect(storable.getId()).toBe(id)
  })

  it('check value', () => {
    const storable = new StorableTx(dto, testChecker)
    expect(storable.getValue()).toEqual({ ...dto, id, created: storable.getValue().created })
  })

  it('check connection with StorageManager', async () => {
    const waitTimeout = 300
    const storable = new StorableTx(dto, testChecker, waitTimeout)
    const storageManager = new StorageManager<IStorable<TransactionLike>>()
    const updateItem = jest.spyOn(storageManager, 'updateItem')
    const addToStorage = jest.spyOn(storable, 'addToStorage')
    const removeFromStorage = jest.spyOn(storable, 'removeFromStorage')
    const waitStatus = jest.spyOn(testChecker, 'waitStatus')
    storageManager.addItem(storable)

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)
    expect(waitStatus).toBeCalledTimes(1)
    expect(waitStatus).toHaveBeenCalledWith(storable.getValue(), { waitTimeout })
    expect(updateItem).toBeCalledTimes(0)

    // wait checking status
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(1)
    expect(updateItem).toHaveBeenCalledWith(storable.getId(), storable)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)

    storageManager.removeItem(storable.getId())

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)
  })
})
