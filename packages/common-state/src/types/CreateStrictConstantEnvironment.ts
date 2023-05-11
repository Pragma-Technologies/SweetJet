import { Defined } from '@pragma-web-utils/core'
import React, { FC, PropsWithChildren } from 'react'
import { HookCommonState } from '../types'

export interface WrapperProps<T = unknown> {
  stateValue: HookCommonState<T | undefined>
  Skeleton: FC
  ErrorState: FC
}

export interface StrictWrapperProps<T = unknown> {
  stateValue?: HookCommonState<T | undefined>
  skeleton: FC
  error: FC
}

export interface StateWrapperProps<T = unknown> {
  stateValue: HookCommonState<T | undefined>
}

export type CreateStateContextEnvironmentOutput<T> = {
  strictValueHook: () => Defined<T>
  stateHook: () => HookCommonState<T>
  strictWrapper: FC<PropsWithChildren<StrictWrapperProps<T>>>
  stateWrapper: FC<PropsWithChildren<StateWrapperProps<T>>>
}

export type CreateStateContextEnvironmentOption<T> = {
  isValueValid?: (value: T) => boolean
  userContext?: React.Context<T> | React.Context<unknown>
}
