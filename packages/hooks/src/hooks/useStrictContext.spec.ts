import { renderHook } from '@testing-library/react'
import React from 'react'
import { NOT_PROVIDED_STRICT_CONTEXT } from '../constants'
import { useStrictContext } from './useStrictContext'

describe('useStrictContext', () => {
  it('should throw an error if the context is not provided', () => {
    const mockContext = React.createContext<unknown>(undefined)
    const { error } = renderHook(() => useStrictContext(mockContext)).result
    expect(error).toBe(NOT_PROVIDED_STRICT_CONTEXT)
  })

  it('should throw an error with a custom message if the context is not provided', () => {
    const mockContext = React.createContext<unknown>(undefined)
    const { error } = renderHook(() => useStrictContext(mockContext, 'Custom Message')).result
    expect(error).toBe('Custom Message: Not provided strict context')
  })

  it('should return the context value if it is provided', () => {
    const mockContext = React.createContext<unknown>('contextValue')
    const { current } = renderHook(() => useStrictContext(mockContext)).result
    expect(current).toBe('contextValue')
  })

  it('check isValueValid function: valid undefined', () => {
    const mockContext = React.createContext<unknown>(undefined)
    const { current } = renderHook(() => useStrictContext(mockContext, '', () => true)).result
    expect(current).toBe(undefined)
  })

  it('check isValueValid function: valid value', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext<string>(customValue)
    const { current } = renderHook(() => useStrictContext(mockContext, '', (value) => value === customValue)).result
    expect(current).toBe(customValue)
  })

  it('check isValueValid function: invalid value', () => {
    const customValue = 'Custom value'
    const mockContext = React.createContext<string>(customValue)
    const { error } = renderHook(() => useStrictContext(mockContext, '', (value) => value !== customValue)).result
    expect(error).toBe(NOT_PROVIDED_STRICT_CONTEXT)
  })
})
