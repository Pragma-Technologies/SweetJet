import { Context, useContext } from 'react'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT } from '../constants'
import { ActualStateValue, CommonState, StateValue } from '../types'

export function useStrictStateValueContext<T extends CommonState<unknown, unknown, unknown>>(
  context: Context<T>,
  name?: string,
  isValueValid: (value: StateValue<T>) => boolean = (value) => value !== undefined && value !== null,
): ActualStateValue<T> {
  const contextValue = useContext(context)
  if (!isValueValid(contextValue.value as StateValue<T>)) {
    throw name ? `${name}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}` : NOT_PROVIDED_STATE_STRICT_CONTEXT
  }
  return contextValue.value as ActualStateValue<T>
}
