import React, { FC, PropsWithChildren } from 'react'
import { useStrictContext } from '../hooks'
import { CreateStrictEnvironmentOutput, WrapperProps } from '../types'

export function createStrictEnvironment<T>(
  context: React.Context<unknown | T>,
  contextName: string,
): CreateStrictEnvironmentOutput<T> {
  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<PropsWithChildren<WrapperProps<T>>> = ({ children, Skeleton, ErrorState, valueState }) => {
    const { isActual, value, error } = valueState

    if (!isActual) {
      return <Skeleton />
    }

    if (!value || error) {
      return <ErrorState />
    }

    return <context.Provider value={value}>{children}</context.Provider>
  }

  return { hook, wrapper }
}
