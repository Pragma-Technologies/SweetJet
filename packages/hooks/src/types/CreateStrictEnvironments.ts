import React, { FC, PropsWithChildren } from 'react'

/**
 * @deprecated delete after remove WrapperProps
 */
export interface State<T = unknown, E = unknown> {
  value: T
  error: E | undefined
  isLoading: boolean
  isActual: boolean
}

/**
 * @deprecated delete after remove WrapperProps
 */
export interface WrapperProps<T = unknown> {
  valueState: State<T | undefined>
  Skeleton: React.FC
  ErrorState: React.FC
}

/**
 * @deprecated delete after remove WrapperProps
 */
export type CreateStrictEnvironmentOutput<T> = { hook: () => T; wrapper: FC<PropsWithChildren<WrapperProps<T>>> }
