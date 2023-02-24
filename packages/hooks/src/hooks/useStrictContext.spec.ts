import { renderHook } from '@testing-library/react-hooks'
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
})
