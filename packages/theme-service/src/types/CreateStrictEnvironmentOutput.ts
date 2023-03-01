import { FC } from 'react'
import { ThemeContextProps } from './Theme'

export type CreateStrictEnvironmentOutput<T, ThemeNames extends string> = {
  hook: () => T
  wrapper: FC<ThemeContextProps<ThemeNames>>
}
