export interface Subscription {
  unsubscribe(): void
}

export interface Listener<T> {
  next: (data: T) => void
  error: (err: unknown) => void
}
