import { Defined } from '@pragma-web-utils/core'
import { Context, useContext } from 'react'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT } from '../constants'
import { CommonState } from '../types'

export function useStrictStateValueContext<T = unknown>(
  context: Context<CommonState>,
  name?: string,
  isValueValid: (value: T) => boolean = (value) => value !== undefined && value !== null,
): Defined<T> {
  const contextValue = useContext(context)
  if (!isValueValid(contextValue.value as T)) {
    throw name ? `${name}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}` : NOT_PROVIDED_STATE_STRICT_CONTEXT
  }
  return contextValue.value as Defined<T>
}
