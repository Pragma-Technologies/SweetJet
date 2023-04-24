import React, { FC, PropsWithChildren } from 'react'
import { useStrictContext } from '../hooks'
import { CreateStrictEnvironmentOutput, WrapperProps } from '../types'

const isValueValid = (value: unknown) => value !== undefined && value !== null

/**
 * @deprecated use createStateContextEnvironment from @pragma-web-utils/common-state
 */
export function createStrictEnvironment<T>(
  contextName: string,
  userContext?: React.Context<T> | React.Context<unknown>,
): CreateStrictEnvironmentOutput<T> {
  const context = !!userContext ? (userContext as React.Context<unknown>) : React.createContext<unknown>(undefined)

  const hook = (): T => {
    return useStrictContext(context, contextName) as T
  }

  const wrapper: FC<PropsWithChildren<WrapperProps<T>>> = ({ children, Skeleton, ErrorState, valueState }) => {
    const { isActual, value, error } = valueState

    if (!isActual) {
      return <Skeleton />
    }

    if (!isValueValid(value as T) || error) {
      return <ErrorState />
    }

    return <context.Provider value={value}>{children}</context.Provider>
  }

  return { hook, wrapper }
}
