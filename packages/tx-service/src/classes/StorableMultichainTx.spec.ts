import { ConnectorBaseEnum, EMPTY_ADDRESS, IStorable, StorageManager } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { MultichainTxInfo, TransactionLike, TxCheckInfo, WaitTxStatusOptions } from '../types'
import { StorableMultichainTx } from './StorableMultichainTx'
import { TxStatusChecker } from './TxStatusChecker'

const dto: MultichainTxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...',
  status: TransactionStatusEnum.UNKNOWN,
  destination: {
    base: ConnectorBaseEnum.EVM,
    chainId: 2,
  },
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

describe('StorableMultichainTx', () => {
  it('check id', () => {
    const storable = new StorableMultichainTx(dto, testChecker, async () => '0x0...')
    expect(storable.getId()).toBe(id)
  })

  it('check value', () => {
    const storable = new StorableMultichainTx(dto, testChecker, async () => '0x0...')
    expect(storable.getValue()).toEqual({
      ...dto,
      id,
      created: storable.getValue().created,
      status: TransactionStatusEnum.UNKNOWN,
      destination: {
        ...dto.destination,
        status: TransactionStatusEnum.UNKNOWN,
      },
    })
  })

  it('check connection with StorageManager', async () => {
    const waitTimeout = 300
    const storable = new StorableMultichainTx(dto, testChecker, async () => '0x0...', waitTimeout)
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

    // wait checking status of origin tx
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(1)
    expect(updateItem).toHaveBeenCalledWith(storable.getId(), storable)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)

    // wait hash of destination tx
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(2)
    expect(updateItem).toHaveBeenCalledWith(storable.getId(), storable)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)

    // wait checking status of destination tx
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(3)
    expect(updateItem).toHaveBeenCalledWith(storable.getId(), storable)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)

    storageManager.removeItem(storable.getId())

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)
  })
})
