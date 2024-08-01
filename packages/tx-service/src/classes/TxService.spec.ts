import { ConnectorBaseEnum, EMPTY_ADDRESS, StorageListenerTypeEnum } from '@pragma-web-utils/core'
import { TransactionStatusEnum } from '../enums'
import { TxInfo } from '../types'
import { TestTxChecker } from '../utils'
import { StorableTx } from './StorableTx'
import { TxService } from './TxService'

const dto1: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...1',
  status: TransactionStatusEnum.UNKNOWN,
}
const dto2: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...2',
  status: TransactionStatusEnum.UNKNOWN,
}
const dto2_1: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test1' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...2',
  status: TransactionStatusEnum.UNKNOWN,
}
const dto3: TxInfo = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
  hash: '0x...3',
  status: TransactionStatusEnum.UNKNOWN,
}

const testChecker = new TestTxChecker()
const checkersMap = new Map([[1, testChecker]])
const storable1 = new StorableTx(dto1, checkersMap, () => Promise.resolve(null))
const storable2 = new StorableTx(dto2, checkersMap, () => Promise.resolve(null))
const storable2_1 = new StorableTx(dto2_1, checkersMap, () => Promise.resolve(null))
const storable3 = new StorableTx(dto3, checkersMap, () => Promise.resolve(null))

describe('TxService', () => {
  it('init and adding items', () => {
    const onAdd = jest.fn()
    const onListChanges = jest.fn()
    const onAddFiltered = jest.fn()
    const onListChangesFiltered = jest.fn()
    const txService = new TxService()
    txService.add(storable1, storable2)

    txService.addListener(StorageListenerTypeEnum.ON_ADD, onAdd)
    txService.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, onListChanges)
    txService.addListener(StorageListenerTypeEnum.ON_ADD, onAddFiltered, (data) => data.id === storable2.getId())
    txService.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      onListChangesFiltered,
      (data) => data.id === storable2.getId(),
    )

    expect(txService.getList().length).toBe(2)
    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(true)
    expect(txService.getItem(storable2.getId())).toBe(storable2)
    expect(txService.hasItem(storable3.getId())).toBe(false)
    expect(txService.getItem(storable3.getId())).toBe(undefined)
    expect(onAdd).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    txService.add(storable2_1)

    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(true)
    expect(txService.getItem(storable2.getId())).toBe(storable2)
    expect(txService.hasItem(storable3.getId())).toBe(false)
    expect(txService.getItem(storable3.getId())).toBe(undefined)
    expect(onAdd).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    txService.add(storable3)

    expect(txService.getList().length).toBe(3)
    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(true)
    expect(txService.getItem(storable2.getId())).toBe(storable2)
    expect(txService.hasItem(storable3.getId())).toBe(true)
    expect(txService.getItem(storable3.getId())).toBe(storable3)
    expect(onAdd).toBeCalledTimes(1)
    expect(onListChanges).toBeCalledTimes(1)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(1)
    expect(onAdd).toBeCalledWith(storable3.getValue())
    expect(onListChanges).toHaveBeenCalledWith([storable1.getValue(), storable2.getValue(), storable3.getValue()])
    expect(onListChangesFiltered).toHaveBeenCalledWith([storable2.getValue()])

    const filteredList = txService.getList((item) => item.id === storable1.getId() || item === storable2.getValue())
    expect(filteredList.length).toBe(2)
    expect(filteredList).toEqual([storable1.getValue(), storable2.getValue()])
  })

  it('remove item', () => {
    const onRemove = jest.fn()
    const onListChanges = jest.fn()
    const onRemoveFiltered = jest.fn()
    const onListChangesFiltered = jest.fn()
    const txService = new TxService()
    txService.add(storable1, storable2)

    txService.addListener(StorageListenerTypeEnum.ON_REMOVE, onRemove)
    txService.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, onListChanges)
    txService.addListener(StorageListenerTypeEnum.ON_REMOVE, onRemoveFiltered, (data) => data.id === storable3.getId())
    txService.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      onListChangesFiltered,
      (data) => data.id === storable3.getId(),
    )

    expect(txService.getList().length).toBe(2)
    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(true)
    expect(txService.getItem(storable2.getId())).toBe(storable2)
    expect(txService.hasItem(storable3.getId())).toBe(false)
    expect(txService.getItem(storable3.getId())).toBe(undefined)
    expect(onRemove).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    txService.remove(storable3.getId())

    expect(txService.getList().length).toBe(2)
    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(true)
    expect(txService.getItem(storable2.getId())).toBe(storable2)
    expect(txService.hasItem(storable3.getId())).toBe(false)
    expect(txService.getItem(storable3.getId())).toBe(undefined)
    expect(onRemove).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    txService.remove(storable2.getId())

    expect(txService.getList().length).toBe(1)
    expect(txService.hasItem(storable1.getId())).toBe(true)
    expect(txService.getItem(storable1.getId())).toBe(storable1)
    expect(txService.hasItem(storable2.getId())).toBe(false)
    expect(txService.getItem(storable2.getId())).toBe(undefined)
    expect(txService.hasItem(storable3.getId())).toBe(false)
    expect(txService.getItem(storable3.getId())).toBe(undefined)
    expect(onRemove).toBeCalledTimes(1)
    expect(onListChanges).toBeCalledTimes(1)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(1)
    expect(onRemove).toBeCalledWith(storable2.getValue())
    expect(onListChanges).toHaveBeenCalledWith([storable1.getValue()])
    expect(onListChangesFiltered).toHaveBeenCalledWith([])
  })
})
