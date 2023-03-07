import React, { FC, PropsWithChildren } from 'react'
import { useStrictContext } from '../hooks'
import { ConstantWrapperProps, CreateStrictConstantEnvironmentOutput } from '../types'

export function createStrictConstantEnvironment<T>(
  contextName: string,
  userContext?: React.Context<T> | React.Context<unknown>,
): CreateStrictConstantEnvironmentOutput<T> {
  const context = !!userContext ? (userContext as React.Context<unknown>) : React.createContext<unknown>(undefined)

  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<PropsWithChildren<ConstantWrapperProps<T>>> = ({ children, valueState }) => {
    return <context.Provider value={valueState}>{children}</context.Provider>
  }

  return { hook, wrapper }
}
