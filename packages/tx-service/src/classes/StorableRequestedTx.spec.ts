import { ConnectorBaseEnum, EMPTY_ADDRESS, IStorable, StorageManager } from '@pragma-web-utils/core'
import { RequestedTransaction, TransactionLike } from '../types'
import { StorableRequestedTx } from './StorableRequestedTx'

const dto: RequestedTransaction = {
  account: EMPTY_ADDRESS,
  chainId: 1,
  created: 0,
  id: `EVM_1_0`,
  payload: { action: 'test' },
  base: ConnectorBaseEnum.EVM,
}

jest.spyOn(Date, 'now').mockImplementation(() => 0)

describe('StorableRequestedTx', () => {
  it('check id', () => {
    const storable = new StorableRequestedTx(dto)
    expect(storable.getId()).toBe(dto.id)
  })

  it('check init already created dto', () => {
    const storable1 = new StorableRequestedTx(dto)
    expect(storable1.getValue().created).toBe(0)

    const storable2 = new StorableRequestedTx({ ...dto, created: -1 })
    expect(storable2.getValue().created).toBe(-1)
  })

  it('check value', () => {
    const storable = new StorableRequestedTx(dto)
    expect(storable.getValue()).toEqual(dto)
  })

  it('check connection with StorageManager', () => {
    const storable = new StorableRequestedTx(dto)
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
