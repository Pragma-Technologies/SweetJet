import { BaseStatesStorage, Destructor, StateListener, StatesStorage } from '../types'

export class CommonStatesStorage<T extends BaseStatesStorage = BaseStatesStorage> implements StatesStorage<T> {
  private _storage: Partial<T> = {}
  private _listeners: StateListener<T, keyof T>[] = []

  getState<K extends keyof T>(stateKey: K): T[K] | undefined {
    return this._storage[stateKey]
  }

  updateState<K extends keyof T>(stateKey: K, state: T[K]): void {
    this._storage[stateKey] = state
    this._listeners.filter((listener) => listener.stateKey === stateKey).forEach((listener) => listener.callback(state))
  }

  listenState<K extends keyof T>(stateKey: K, callback: (value: T[K]) => void): Destructor {
    const _listener: StateListener<T, keyof T> = {
      stateKey,
      callback: callback as (value: T[keyof T]) => void,
      destructor: () => (this._listeners = this._listeners.filter((listener) => listener !== _listener)),
    }
    this._listeners.push(_listener)
    return _listener.destructor
  }
}
