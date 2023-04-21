import { Defined } from '@pragma-web-utils/core'
import React, { Context, createContext, FC, PropsWithChildren, useContext } from 'react'
import { useStrictStateValueContext } from '../hooks'
import { CreateStateContextEnvironmentOutput, HookCommonState, WrapperProps } from '../types'

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
  userContext?: React.Context<T> | React.Context<unknown>,
): CreateStateContextEnvironmentOutput<T> {
  const context = !!userContext ? (userContext as Context<HookCommonState>) : createContext<HookCommonState>(emptyState)

  const strictValueHook = (): Defined<T> => useStrictStateValueContext<T>(context, contextName)
  const stateHook = (): HookCommonState<T> => useContext(context) as HookCommonState<T>

  const wrapper: FC<PropsWithChildren<WrapperProps<T>>> = ({ children, Skeleton, ErrorState, stateValue }) => {
    const { isActual, value, error } = stateValue

    if (!isActual) {
      return <Skeleton />
    }

    if (!value || error) {
      return <ErrorState />
    }

    return <context.Provider value={stateValue}> {children} </context.Provider>
  }

  return { strictValueHook, stateHook, wrapper }
}
