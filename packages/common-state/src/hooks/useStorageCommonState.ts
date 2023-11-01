// hook types overloading
import { StateManager, StateStore, StateStoreOptions, StorageStateStoreFactory } from '../types'
import { commonStateFactory } from '../utils'

export function useStorageCommonState<Value, Error>(
  factory: StorageStateStoreFactory<Value, Error>,
): <Value, Error = unknown>(stateKey: string, initial?: undefined) => StateManager<Value, Error>
export function useStorageCommonState<Value, Error>(
  factory: StorageStateStoreFactory<Value, Error, Value>,
): <Value, Error = unknown>(stateKey: string, initial: Value | (() => Value)) => StateManager<Value, Error, Value>
export function useStorageCommonState<Value, Error, Initial>(
  factory: StorageStateStoreFactory<Value, Error, Initial>,
): <Value, Error = unknown, Initial = unknown>(
  stateKey: string,
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial>

export function useStorageCommonState<Value, Error, Initial>(
  factory: StorageStateStoreFactory<Value, Error, Initial>,
): <Value, Error, Initial>(
  stateKey: string,
  initial: Initial | (() => Initial),
) => StateManager<Value, Error, Initial> {
  return <Value, Error, Initial>(
    stateKey: string,
    initial: Initial | (() => Initial),
  ): StateManager<Value, Error, Initial> => {
    const stateStorage = (options: StateStoreOptions<Value, Error, Initial>): StateStore<Value, Error, Initial> =>
      // @ts-ignore TODO: finish types errors
      factory(stateKey, options)
    return commonStateFactory(stateStorage)(initial)
  }
}
