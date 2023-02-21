import { FC } from 'react'
import { ThemeContextProps } from './Theme'

export type CreateStrictEnvironmentOutput<T> = { hook: () => T; wrapper: FC<ThemeContextProps> }
