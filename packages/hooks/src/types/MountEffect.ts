import { EffectCallback } from 'react'
import { Deps } from './common'

export interface MountEffectProps {
  callback?: EffectCallback
  onInit?: EffectCallback
  deps?: Deps
}

export type MountEffect = ({ callback, onInit, deps }: MountEffectProps) => void
