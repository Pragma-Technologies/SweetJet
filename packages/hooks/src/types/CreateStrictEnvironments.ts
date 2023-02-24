import { State } from '@pragma-web-utils/common-state'
import React, { FC, PropsWithChildren } from 'react'

export interface WrapperProps<T = unknown> {
  valueState: State<T | undefined>
  Skeleton: React.FC
  ErrorState: React.FC
}

export type CreateStrictEnvironmentOutput<T> = { hook: () => T; wrapper: FC<PropsWithChildren<WrapperProps<T>>> }
