import { useEffect, useRef } from 'react'
import { MountEffect } from '../types'

export const useMountEffectFactory = (): MountEffect => {
  const initRef = useRef(false)

  return ({ callback, onInit, deps }) =>
    useEffect(() => {
      const destructor = initRef.current ? callback?.() : onInit?.()
      return () => {
        // mark as initiated in destructor, bsc we don't know how many times useMountEffect will be used
        // but destructor is called always after all useEffect callbacks
        initRef.current = true
        destructor?.()
      }
    }, deps)
}
