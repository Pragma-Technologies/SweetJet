import { StorageListenerTypeEnum } from '../enums'
import { IStorable } from '../types'
import { StorageManager } from './StorageManager'

const getStorable = (
  id: string,
  value: string,
  onAdd: (storageManager: StorageManager<IStorable<string>>) => void,
  onRemove: () => void,
): IStorable<string> => {
  return {
    getId(): string {
      return id
    },
    getValue(): string {
      return value
    },
    addToStorage(storageManager: StorageManager<IStorable<string>>) {
      onAdd(storageManager)
    },
    removeFromStorage() {
      onRemove()
    },
  }
}

const id1 = 'id1'
const id2 = 'id2'
const id3 = 'id3'
const value1 = 'value1'
const value2 = 'value2'
const value3 = 'value3'

describe('StorageManager', () => {
  it('init and adding items', () => {
    const onAddToStorage = jest.fn()
    const onRemoveFromStorage = jest.fn()
    const onAdd = jest.fn()
    const onListChanges = jest.fn()
    const onAddFiltered = jest.fn()
    const onListChangesFiltered = jest.fn()
    const storable1 = getStorable(id1, value1, onAddToStorage, onRemoveFromStorage)
    const storable2 = getStorable(id2, value2, onAddToStorage, onRemoveFromStorage)
    const storable2_1 = getStorable(id2, value1, onAddToStorage, onRemoveFromStorage)
    const storable3 = getStorable(id3, value3, onAddToStorage, onRemoveFromStorage)
    const initValues = [storable1, storable2]
    const storageManager = new StorageManager<IStorable<string>>(initValues)

    storageManager.addListener(StorageListenerTypeEnum.ON_ADD, onAdd)
    storageManager.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, onListChanges)
    storageManager.addListener(StorageListenerTypeEnum.ON_ADD, onAddFiltered, (data) => data.getId() === id2)
    storageManager.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      onListChangesFiltered,
      (data) => data.getId() === id2,
    )

    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onAdd).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.addItem(storable2_1)

    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onAdd).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.addItem(storable3)

    expect(onRemoveFromStorage).toBeCalledTimes(0)
    expect(onAddToStorage).toBeCalledTimes(3)
    expect(storageManager.getStoredList().length).toBe(3)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(true)
    expect(storageManager.getItem(id3)).toBe(storable3)
    expect(onAdd).toBeCalledTimes(1)
    expect(onListChanges).toBeCalledTimes(1)
    expect(onAddFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(1)
    expect(onAdd).toBeCalledWith(storable3)
    expect(onListChanges).toHaveBeenCalledWith([storable1, storable2, storable3])
    expect(onListChangesFiltered).toHaveBeenCalledWith([storable2])

    const filteredList = storageManager.getStoredList((item) => item.getId() === id1 || item.getValue() === value2)
    expect(filteredList.length).toBe(2)
    expect(filteredList).toEqual([storable1, storable2])
  })

  it('remove item', () => {
    const onAddToStorage = jest.fn()
    const onRemoveFromStorage = jest.fn()
    const onRemove = jest.fn()
    const onListChanges = jest.fn()
    const onRemoveFiltered = jest.fn()
    const onListChangesFiltered = jest.fn()
    const storable1 = getStorable(id1, value1, onAddToStorage, onRemoveFromStorage)
    const storable2 = getStorable(id2, value2, onAddToStorage, onRemoveFromStorage)
    const initValues = [storable1, storable2]
    const storageManager = new StorageManager<IStorable<string>>(initValues)

    storageManager.addListener(StorageListenerTypeEnum.ON_REMOVE, onRemove)
    storageManager.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, onListChanges)
    storageManager.addListener(StorageListenerTypeEnum.ON_REMOVE, onRemoveFiltered, (data) => data.getId() === id3)
    storageManager.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      onListChangesFiltered,
      (data) => data.getId() === id3,
    )

    expect(onRemoveFromStorage).toBeCalledTimes(0)
    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onRemove).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.removeItem(id3)

    expect(onRemoveFromStorage).toBeCalledTimes(0)
    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onRemove).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.removeItem(id2)

    expect(onRemoveFromStorage).toBeCalledTimes(1)
    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(1)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(false)
    expect(storageManager.getItem(id2)).toBe(undefined)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onRemove).toBeCalledTimes(1)
    expect(onListChanges).toBeCalledTimes(1)
    expect(onRemoveFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(1)
    expect(onRemove).toBeCalledWith(storable2)
    expect(onListChanges).toHaveBeenCalledWith([storable1])
    expect(onListChangesFiltered).toHaveBeenCalledWith([])
  })

  it('update item', () => {
    const onAddToStorage = jest.fn()
    const onRemoveFromStorage = jest.fn()
    const onUpdate = jest.fn()
    const onListChanges = jest.fn()
    const onUpdateFiltered = jest.fn()
    const onListChangesFiltered = jest.fn()
    const storable1 = getStorable(id1, value1, onAddToStorage, onRemoveFromStorage)
    const storable2 = getStorable(id2, value2, onAddToStorage, onRemoveFromStorage)
    const storable2_1 = getStorable(id2, value1, onAddToStorage, onRemoveFromStorage)
    const initValues = [storable1, storable2]
    const storageManager = new StorageManager<IStorable<string>>(initValues)

    storageManager.addListener(StorageListenerTypeEnum.ON_UPDATE, onUpdate)
    storageManager.addListener(StorageListenerTypeEnum.ON_LIST_CHANGES, onListChanges)
    storageManager.addListener(StorageListenerTypeEnum.ON_UPDATE, onUpdateFiltered, (data) => data.getId() === id3)
    storageManager.addListener(
      StorageListenerTypeEnum.ON_LIST_CHANGES,
      onListChangesFiltered,
      (data) => data.getId() === id3,
    )

    expect(onRemoveFromStorage).toBeCalledTimes(0)
    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onUpdate).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onUpdateFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.updateItem(id3, storable2_1)

    expect(onRemoveFromStorage).toBeCalledTimes(0)
    expect(onAddToStorage).toBeCalledTimes(2)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onUpdate).toBeCalledTimes(0)
    expect(onListChanges).toBeCalledTimes(0)
    expect(onUpdateFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(0)

    storageManager.updateItem(id2, storable2_1)

    expect(onRemoveFromStorage).toBeCalledTimes(1)
    expect(onAddToStorage).toBeCalledTimes(3)
    expect(storageManager.getStoredList().length).toBe(2)
    expect(storageManager.hasItem(id1)).toBe(true)
    expect(storageManager.getItem(id1)).toBe(storable1)
    expect(storageManager.hasItem(id2)).toBe(true)
    expect(storageManager.getItem(id2)).toBe(storable2_1)
    expect(storageManager.hasItem(id3)).toBe(false)
    expect(storageManager.getItem(id3)).toBe(undefined)
    expect(onUpdate).toBeCalledTimes(1)
    expect(onListChanges).toBeCalledTimes(1)
    expect(onUpdateFiltered).toBeCalledTimes(0)
    expect(onListChangesFiltered).toBeCalledTimes(1)
    expect(onUpdate).toBeCalledWith({ newValue: storable2_1, oldValue: storable2 })
    expect(onListChanges).toHaveBeenCalledWith([storable1, storable2_1])
    expect(onListChangesFiltered).toHaveBeenCalledWith([])
  })
})
