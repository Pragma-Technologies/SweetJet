import React, { Context, createContext, FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { CommonStatesStorage } from '../class/CommonStatesStorage'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT, NOT_REGISTERED_STATE } from '../constants'
import {
  ActualStateValue,
  BaseStatesStorage,
  StatesStorage,
  StateValue,
  StrictStorageState,
  StrictStorageWrapper,
} from '../types'

const commonStatesStorage = new CommonStatesStorage()
export const CommonStatesContext: Context<StatesStorage<BaseStatesStorage>> =
  createContext<StatesStorage<BaseStatesStorage>>(commonStatesStorage)

export function registerCommonStateStorage<T extends BaseStatesStorage>(
  storage: StatesStorage<T>,
): Context<StatesStorage<T>> {
  return createContext<StatesStorage<T>>(storage)
}

export function getStrictWrapper<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
  isValueValid: (stateKey: K, value: StateValue<StrictStorageState<T, K>>) => boolean = (stateKey, value) =>
    value !== undefined && value !== null,
): FC<PropsWithChildren<StrictStorageWrapper<T, K>>> {
  return (props) => {
    const { isActual, value, error } = useStateValue(context, props.stateKey)

    if (!isActual) {
      return <props.skeleton />
    }

    if (!isValueValid(props.stateKey, value as StateValue<StrictStorageState<T, K>>) || error) {
      return <props.error />
    }

    return <>{props.children}</>
  }
}

export function useStateValue<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
  stateKey: K,
): StrictStorageState<T, K> {
  const contextValue = useContext(context)
  const [state, setState] = useState(() => contextValue.getState(stateKey))

  useEffect(() => {
    setState(contextValue.getState(stateKey))
    return contextValue.listenState(stateKey, setState)
  }, [stateKey])

  if (state === undefined || state === null) {
    throw `${stateKey as string}: ${NOT_REGISTERED_STATE}`
  }
  return state as StrictStorageState<T, K>
}

export function useStrictStateValue<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
  stateKey: K,
  isValueValid: (stateKey: K, value: StateValue<StrictStorageState<T, K>>) => boolean = () => true,
): ActualStateValue<StrictStorageState<T, K>> {
  const state = useStateValue(context, stateKey)

  if (state === undefined || state === null || !isValueValid(stateKey, state as StateValue<StrictStorageState<T, K>>)) {
    throw `${stateKey as string}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}`
  }
  return state.value as ActualStateValue<StrictStorageState<T, K>>
}

export function useRegisterStateToStorage<T extends BaseStatesStorage, K extends keyof T>(
  context: Context<StatesStorage<T>>,
  stateKey: K,
  state: StrictStorageState<T, K>,
): void {
  const contextValue = useContext(context)
  useState(() => contextValue.updateState(stateKey, state))

  useEffect(() => {
    const prevState = contextValue.getState(stateKey)
    if (prevState !== state) {
      contextValue.updateState(stateKey, state)
    }
  }, [state])
}
