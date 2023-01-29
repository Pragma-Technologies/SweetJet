import {
  ConnectorBaseEnum,
  EMPTY_ADDRESS,
  IStorable,
  StorageListenerTypeEnum,
  StorageManager,
} from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { MultichainTxInfo, TransactionLike } from '../types'
import { TestTxChecker } from '../utils'
import { StorableMultichainTx } from './StorableMultichainTx'

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

const testChecker = new TestTxChecker()

describe('StorableMultichainTx', () => {
  beforeAll(() => jest.spyOn(Date, 'now').mockImplementation(() => 0))

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
    const onOldValue = jest.fn()
    const onNewValue = jest.fn()

    storageManager.addListener(
      StorageListenerTypeEnum.ON_UPDATE,
      ({ oldValue, newValue }) => {
        onOldValue(oldValue.getValue())
        onNewValue(newValue.getValue())
      },
      (tx) => tx.getId() === storable.getId(),
    )

    storageManager.addItem(storable)

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)
    expect(waitStatus).toBeCalledTimes(1)
    expect(waitStatus).toHaveBeenCalledWith(storable.getValue(), { waitTimeout })
    expect(updateItem).toBeCalledTimes(0)
    expect(onOldValue).toBeCalledTimes(0)
    expect(onNewValue).toBeCalledTimes(0)

    // wait checking status of origin tx
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(1)
    expect(onNewValue).toBeCalledTimes(1)
    expect(onOldValue).toBeCalledTimes(1)
    expect(onOldValue).toHaveBeenCalledWith(storable.getValue())
    expect(onNewValue).toHaveBeenCalledWith({ ...storable.getValue(), status: TransactionStatusEnum.SUCCESS })
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait hash of destination tx
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(2)
    expect(onNewValue).toBeCalledTimes(2)
    expect(onOldValue).toBeCalledTimes(2)
    expect(onOldValue).toHaveBeenCalledWith(storable.getValue())
    expect(onNewValue).toHaveBeenCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      destination: { ...storable.getValue().destination, hash: '0x0...' },
    })
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait checking status of destination tx
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(3)
    expect(onNewValue).toBeCalledTimes(3)
    expect(onOldValue).toBeCalledTimes(3)
    expect(onOldValue).toHaveBeenCalledWith(storable.getValue())
    expect(onNewValue).toHaveBeenCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      destination: { ...storable.getValue().destination, hash: '0x0...', status: TransactionStatusEnum.SUCCESS },
    })
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    storageManager.removeItem(storable.getId())

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)
  })
})
