import {
  ConnectorBaseEnum,
  EMPTY_ADDRESS,
  IStorable,
  StorageListenerTypeEnum,
  StorageManager,
} from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { Transaction, TxInfo } from '../types'
import { TestTxChecker } from '../utils'
import { StorableTx } from './StorableTx'

const dto1: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x00...01',
  status: TransactionStatusEnum.UNKNOWN,
}
const dto2: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 2,
  payload: { action: 'test2' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x00...01',
  status: TransactionStatusEnum.UNKNOWN,
}
const dto3: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 3,
  payload: { action: 'test3' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x00...01',
  status: TransactionStatusEnum.UNKNOWN,
}
const id = `${dto1.base}_${dto1.chainId}_${dto1.hash}`

const testChecker = new TestTxChecker()
const checkersMap = new Map([
  [1, testChecker],
  [2, testChecker],
  [3, testChecker],
])

describe('StorableTx (multi tx)', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(Date, 'now').mockImplementation(() => 0)
  })

  it('check multi transaction progress', async () => {
    const waitTimeout = 300
    const storable = new StorableTx(
      dto1,
      checkersMap,
      (dto) => {
        switch (dto.chainId) {
          case 1:
            return Promise.resolve(dto2)
          case 2:
            return Promise.resolve(dto3)
          case 3:
            return Promise.resolve(null)
          default:
            return Promise.resolve(null)
        }
      },
      waitTimeout,
    )
    const storageManager = new StorageManager<IStorable<Transaction>>()
    const updateItem = jest.spyOn(storageManager, 'updateItem')
    const addToStorage = jest.spyOn(storable, 'addToStorage')
    const removeFromStorage = jest.spyOn(storable, 'removeFromStorage')
    const onOldValue = jest.fn()
    const onNewValue = jest.fn()
    const waitStatus = jest.spyOn(testChecker, 'waitStatus')

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

    // wait checking status
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(1)
    expect(onNewValue).toBeCalledTimes(1)
    expect(onOldValue).toBeCalledTimes(1)
    expect(onOldValue).toHaveBeenCalledWith(storable.getValue())
    expect(onNewValue).toHaveBeenCalledWith({ ...storable.getValue(), status: TransactionStatusEnum.SUCCESS })
    expect(storable.getValue().status).toBe(TransactionStatusEnum.UNKNOWN)
    expect(storageManager.getItem(storable.getId())?.getValue().status).toBe(TransactionStatusEnum.SUCCESS)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait checking status
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(2)
    expect(onNewValue).toBeCalledTimes(2)
    expect(onOldValue).toBeCalledTimes(2)
    expect(onOldValue).toHaveBeenLastCalledWith({ ...storable.getValue(), status: TransactionStatusEnum.SUCCESS })
    expect(onNewValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: { ...dto2, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.UNKNOWN },
    })
    expect(storable.getValue().status).toBe(TransactionStatusEnum.UNKNOWN)
    expect(storageManager.getItem(storable.getId())?.getValue().status).toBe(TransactionStatusEnum.SUCCESS)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait checking status
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(3)
    expect(onNewValue).toBeCalledTimes(3)
    expect(onOldValue).toBeCalledTimes(3)
    expect(onOldValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: { ...dto2, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.UNKNOWN },
    })
    expect(onNewValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: { ...dto2, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.SUCCESS },
    })
    expect(storable.getValue().status).toBe(TransactionStatusEnum.UNKNOWN)
    expect(storageManager.getItem(storable.getId())?.getValue().status).toBe(TransactionStatusEnum.SUCCESS)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait checking status
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(4)
    expect(onNewValue).toBeCalledTimes(4)
    expect(onOldValue).toBeCalledTimes(4)
    expect(onOldValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: { ...dto2, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.SUCCESS },
    })
    expect(onNewValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: {
        ...dto2,
        created: 0,
        id: 'EVM_1_0x00...01',
        status: TransactionStatusEnum.SUCCESS,
        nextTx: { ...dto3, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.UNKNOWN },
      },
    })
    expect(storable.getValue().status).toBe(TransactionStatusEnum.UNKNOWN)
    expect(storageManager.getItem(storable.getId())?.getValue().status).toBe(TransactionStatusEnum.SUCCESS)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    // wait checking status
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(updateItem).toBeCalledTimes(5)
    expect(onNewValue).toBeCalledTimes(5)
    expect(onOldValue).toBeCalledTimes(5)
    expect(onOldValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: {
        ...dto2,
        created: 0,
        id: 'EVM_1_0x00...01',
        status: TransactionStatusEnum.SUCCESS,
        nextTx: { ...dto3, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.UNKNOWN },
      },
    })
    expect(onNewValue).toHaveBeenLastCalledWith({
      ...storable.getValue(),
      status: TransactionStatusEnum.SUCCESS,
      nextTx: {
        ...dto2,
        created: 0,
        id: 'EVM_1_0x00...01',
        status: TransactionStatusEnum.SUCCESS,
        nextTx: { ...dto3, created: 0, id: 'EVM_1_0x00...01', status: TransactionStatusEnum.SUCCESS },
      },
    })
    expect(storable.getValue().status).toBe(TransactionStatusEnum.UNKNOWN)
    expect(storageManager.getItem(storable.getId())?.getValue().status).toBe(TransactionStatusEnum.SUCCESS)
    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)

    storageManager.removeItem(storable.getId())

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)
  })
})
