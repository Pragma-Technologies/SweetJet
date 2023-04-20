import { Defined } from '@pragma-web-utils/core'
import { Context, useContext } from 'react'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT } from '../constants'
import { HookCommonState } from '../types'

export function useStrictStateValueContext<T = unknown>(context: Context<HookCommonState>, name?: string): Defined<T> {
  const contextValue = useContext(context)
  if (contextValue.value === undefined || contextValue.value === null) {
    throw name ? `${name}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}` : NOT_PROVIDED_STATE_STRICT_CONTEXT
  }
  return contextValue.value as Defined<T>
}
