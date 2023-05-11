import { Defined } from '@pragma-web-utils/core'
import React, { Context, createContext, FC, PropsWithChildren, useContext } from 'react'
import { useStrictStateValueContext } from '../hooks'
import {
  CreateStateContextEnvironmentOption,
  CreateStateContextEnvironmentOutput,
  HookCommonState,
  WrapperProps,
} from '../types'

const emptyState: HookCommonState = {
  value: undefined,
  error: undefined,
  isActual: false,
  isLoading: false,
  cached: undefined,
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

export function createStateContextEnvironment<T>(
  contextName: string,
  option?: CreateStateContextEnvironmentOption<T>,
): CreateStateContextEnvironmentOutput<T> {
  const { userContext, isValueValid = (value: T) => value !== undefined && value !== null } = { ...option }
  const context = !!userContext ? (userContext as Context<HookCommonState>) : createContext<HookCommonState>(emptyState)

  const strictValueHook = (): Defined<T> => useStrictStateValueContext<T>(context, contextName, isValueValid)
  const stateHook = (): HookCommonState<T> => useContext(context) as HookCommonState<T>

  const wrapper: FC<PropsWithChildren<WrapperProps<T>>> = ({ children, Skeleton, ErrorState, stateValue }) => {
    const { isActual, value, error } = stateValue

    if (!isActual) {
      return <Skeleton />
    }

    if (!isValueValid(value as T) || error) {
      return <ErrorState />
    }

    return <context.Provider value={stateValue}> {children} </context.Provider>
  }

  return { strictValueHook, stateHook, wrapper }
}
