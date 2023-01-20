import { ConnectorBaseEnum, EMPTY_ADDRESS, IStorable, StorageManager } from '@pragma-web-utils/core'
import { TransactionLike } from '../types'
import { StorableTransactionLike } from './StorableTransactionLike'

const dto: TransactionLike = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  created: 0,
  id: `EVM_1_0`,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
}

describe('StorableTransactionLike', () => {
  it('check id', () => {
    const storable = new StorableTransactionLike(dto)
    expect(storable.getId()).toBe(dto.id)
  })

  it('check value', () => {
    const storable = new StorableTransactionLike(dto)
    expect(storable.getValue()).toBe(dto)
  })

  it('check connection with StorageManager', () => {
    const storable = new StorableTransactionLike(dto)
    const storageManager = new StorageManager<IStorable<TransactionLike>>()
    const addToStorage = jest.spyOn(storable, 'addToStorage')
    const removeFromStorage = jest.spyOn(storable, 'removeFromStorage')
    storageManager.addItem(storable)

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(0)

    storageManager.removeItem(storable.getId())

    expect(addToStorage).toBeCalledTimes(1)
    expect(removeFromStorage).toBeCalledTimes(1)
  })
})
