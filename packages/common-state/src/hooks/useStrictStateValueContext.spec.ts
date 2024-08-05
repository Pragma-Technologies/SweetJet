import { renderHook } from '@testing-library/react'
import React from 'react'
import { NOT_PROVIDED_STATE_STRICT_CONTEXT } from '../constants'
import { CommonState } from '../types'
import { useStrictStateValueContext } from './useStrictStateValueContext'

const emptyState: CommonState = {
  value: undefined,
  error: undefined,
  isActual: false,
  isLoading: false,
  cached: undefined,
  key: '',
  softRefresh: () => undefined,
  hardRefresh: () => undefined,
}

describe('useStrictStateValueContext', () => {
  it('should throw an error if the context is not provided', () => {
    const mockContext = React.createContext<CommonState>(emptyState)
    const { error } = renderHook(() => useStrictStateValueContext(mockContext)).result
    expect(error).toBe(NOT_PROVIDED_STATE_STRICT_CONTEXT)
  })

  it('should throw an error with a custom message if the context is not provided', () => {
    const mockContext = React.createContext<CommonState>(emptyState)
    const customMessage = 'Custom Message'
    const { error } = renderHook(() => useStrictStateValueContext(mockContext, customMessage)).result
    expect(error).toBe(`${customMessage}: ${NOT_PROVIDED_STATE_STRICT_CONTEXT}`)
  })

  it('should return the context value if it is provided', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext({ ...emptyState, value: customValue } as CommonState)
    const { current } = renderHook(() => useStrictStateValueContext(mockContext)).result
    expect(current).toBe(customValue)
  })

  it('check isValueValid function: valid undefined', () => {
    const mockContext = React.createContext<CommonState>(emptyState)
    const { current } = renderHook(() => useStrictStateValueContext(mockContext, '', () => true)).result
    expect(current).toBe(undefined)
  })

  it('check isValueValid function: valid value', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext({ ...emptyState, value: customValue } as CommonState)
    const { current } = renderHook(() =>
      useStrictStateValueContext(mockContext, '', (value) => value === customValue),
    ).result
    expect(current).toBe(customValue)
  })

  it('check isValueValid function: invalid value', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext({ ...emptyState, value: customValue } as CommonState)
    const { error } = renderHook(() =>
      useStrictStateValueContext(mockContext, '', (value) => value !== customValue),
    ).result
    expect(error).toBe(NOT_PROVIDED_STATE_STRICT_CONTEXT)
  })
})
