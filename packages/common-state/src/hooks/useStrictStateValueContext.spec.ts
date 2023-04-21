import { renderHook } from '@testing-library/react-hooks'
import React from 'react'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT } from '../constants'
import { HookCommonState } from '../types'
import { useStrictStateValueContext } from './useStrictStateValueContext'

const emptyState: HookCommonState = {
  value: undefined,
  error: undefined,
  isActual: false,
  isLoading: false,
  cached: undefined,
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

describe('useStrictContext', () => {
  it('should throw an error if the context is not provided', () => {
    const mockContext = React.createContext<HookCommonState>(emptyState)
    const { error } = renderHook(() => useStrictStateValueContext(mockContext)).result
    expect(error).toBe(NOT_PROVIDED_STATE_STRICT_CONTEXT)
  })

  it('should throw an error with a custom message if the context is not provided', () => {
    const mockContext = React.createContext<HookCommonState>(emptyState)
    const customMessage = 'Custom Message'
    const { error } = renderHook(() => useStrictStateValueContext(mockContext, customMessage)).result
    expect(error).toBe(`${customMessage}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}`)
  })

  it('should return the context value if it is provided', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext<HookCommonState>({ ...emptyState, value: customValue })
    const { current } = renderHook(() => useStrictStateValueContext(mockContext)).result
    expect(current).toBe(customValue)
  })
})
