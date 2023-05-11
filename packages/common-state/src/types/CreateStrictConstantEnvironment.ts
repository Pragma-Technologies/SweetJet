import { Defined } from '@pragma-web-utils/core'
import React, { FC, PropsWithChildren } from 'react'
import { HookCommonState } from '../types'

export interface WrapperProps<T = unknown> {
  stateValue: HookCommonState<T | undefined>
  Skeleton: FC
  ErrorState: FC
}

export type CreateStateContextEnvironmentOutput<T> = {
  strictValueHook: () => Defined<T>
  stateHook: () => HookCommonState<T>
  wrapper: FC<PropsWithChildren<WrapperProps<T>>>
}

export type CreateStateContextEnvironmentOption<T> = {
  isValueValid?: (value: T) => boolean
  userContext?: React.Context<T> | React.Context<unknown>
}
