export interface CancellablePromise<T = unknown> {
  cancellablePromise: Promise<T>

  cancel(): void
}

export interface CancellableFactory {
  makeCancellable: <T = unknown>(promise: Promise<T>) => Promise<T>
  makeUnmountable: <T = unknown>(promise: Promise<T>) => Promise<T>

  cancel(): void
}

export interface CancellableFactoryFactory {
  clearCancelablePool(...exceptedKeys: string[]): void
  addToCancelablePool(key: string, value: CancellablePromise): void
  createCancelableFactory(onCancel?: () => void): CancellableFactory
}
