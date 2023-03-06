import { useStrictContext } from '@pragma-web-utils/hooks'
import React, { FC, PropsWithChildren } from 'react'
import { ConstantWrapperProps, CreateStrictConstantEnvironmentOutput } from '../types'

export function createStrictConstantEnvironment<T>(
  contextName: string,
  userContext?: React.Context<unknown | T>,
): CreateStrictConstantEnvironmentOutput<T> {
  const context = !!userContext ? userContext : React.createContext<unknown>(undefined)

  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<PropsWithChildren<ConstantWrapperProps<T>>> = ({ children, valueState }) => {
    return <context.Provider value={valueState}>{children}</context.Provider>
  }

  return { hook, wrapper }
}
