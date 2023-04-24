import { Context, useContext } from 'react'
import { NOT_PROVIDED_STRICT_CONTEXT } from '../constants'

export const useStrictContext = <T = unknown>(
  context: Context<T>,
  name?: string,
  isValueValid: (value: T) => boolean = (value) => value !== undefined && value !== null,
): T => {
  const contextValue = useContext(context)
  if (!isValueValid(contextValue)) {
    throw name ? `${name}: ${NOT_PROVIDED_STRICT_CONTEXT}` : NOT_PROVIDED_STRICT_CONTEXT
  }
  return contextValue as T
}
