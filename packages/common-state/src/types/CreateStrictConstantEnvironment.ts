import { Defined } from '@pragma-web-utils/core'
import React, { FC, PropsWithChildren } from 'react'
import { ActualStateValue, CommonState, StateValue } from '../types'

export interface WrapperProps<T = unknown> {
  stateValue: CommonState<T | undefined>
  Skeleton: FC
  ErrorState: FC
}

export interface StrictWrapperProps<T extends CommonState<unknown, unknown, unknown>> {
  stateValue?: T
  skeleton: FC
  error: FC
}

export interface StateWrapperProps<T extends CommonState<unknown, unknown, unknown>> {
  stateValue: T
}

export type CreateStateContextEnvironmentOutput<T extends CommonState<unknown, unknown, unknown>> = {
  strictValueHook: () => ActualStateValue<T>
  stateHook: () => T
  strictWrapper: FC<PropsWithChildren<StrictWrapperProps<T>>>
  stateWrapper: FC<PropsWithChildren<StateWrapperProps<T>>>
}

export type CreateStateContextEnvironmentOption<T extends CommonState<unknown, unknown, unknown>> = {
  isValueValid?: (value: StateValue<T>) => boolean
  userContext?: React.Context<T> | React.Context<unknown>
}
