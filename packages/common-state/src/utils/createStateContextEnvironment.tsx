import React, { Context, createContext, FC, PropsWithChildren, useContext } from 'react'
import { useStrictStateValueContext } from '../hooks'
import {
  ActualStateValue,
  CommonState,
  CreateStateContextEnvironmentOption,
  CreateStateContextEnvironmentOutput,
  StateValue,
  StateWrapperProps,
  StrictWrapperProps,
} from '../types'

const emptyState: CommonState = {
  value: undefined,
  error: undefined,
  isActual: false,
  isLoading: false,
  cached: undefined,
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

export function createStateContextEnvironment<T extends CommonState<unknown, unknown, unknown>>(
  contextName: string,
  option?: CreateStateContextEnvironmentOption<T>,
): CreateStateContextEnvironmentOutput<T> {
  const { userContext, isValueValid = (value: StateValue<T>) => value !== undefined && value !== null } = { ...option }
  const context = !!userContext ? (userContext as Context<T>) : createContext(emptyState as T)

  const strictValueHook = (): ActualStateValue<T> => useStrictStateValueContext<T>(context, contextName, isValueValid)
  const stateHook = () => useContext(context)

  const stateWrapper: FC<PropsWithChildren<StateWrapperProps<T>>> = ({ stateValue, children }) => {
    return <context.Provider value={stateValue}>{children}</context.Provider>
  }

  const _strictWrapper: FC<PropsWithChildren<Omit<StrictWrapperProps<T>, 'stateValue'>>> = (props) => {
    const { isActual, value, error } = stateHook()

    if (!isActual) {
      return <props.skeleton />
    }

    if (!isValueValid(value as ActualStateValue<T>) || error) {
      return <props.error />
    }

    return <>{props.children}</>
  }

  const strictWrapper: FC<PropsWithChildren<StrictWrapperProps<T>>> = ({ children, stateValue, error, skeleton }) => {
    const strictContent = (
      <_strictWrapper error={error} skeleton={skeleton}>
        {children}
      </_strictWrapper>
    )

    return stateValue ? stateWrapper({ stateValue, children: strictContent }) : strictContent
  }

  return { strictValueHook, stateHook, stateWrapper, strictWrapper }
}
