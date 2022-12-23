import { Listener, Subscription } from '../types'

export class ObservableSubject<T = unknown> {
  protected _listeners = new Map<string, Set<Listener<T>>>()

  sendValue(key: string, data: T): void {
    this._listeners.get(key)?.forEach((listener) => listener.next(data))
  }

  sendError(key: string, data: T): void {
    this._listeners.get(key)?.forEach((listener) => listener.error(data))
    this._listeners.delete(key)
  }

  listen(key: string, listener: Listener<T>): Subscription {
    const relatedListeners = this._listeners.get(key) ?? new Set<Listener<T>>()
    relatedListeners.add(listener)
    this._listeners.set(key, relatedListeners)
    return { unsubscribe: () => this._listeners.get(key)?.delete(listener) }
  }
}
