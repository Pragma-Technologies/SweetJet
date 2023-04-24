import { Defined } from '@pragma-web-utils/core'
import { FC, PropsWithChildren } from 'react'
import { HookCommonState } from '../types'

export interface WrapperProps<T = unknown> {
  stateValue: HookCommonState<T | undefined>
  Skeleton: FC
  ErrorState: FC
  isValueValid?: (value: T) => boolean
}

export type CreateStateContextEnvironmentOutput<T> = {
  strictValueHook: () => Defined<T>
  stateHook: () => HookCommonState<T>
  wrapper: FC<PropsWithChildren<WrapperProps<T>>>
}
