import { FC, PropsWithChildren } from 'react'

export type ConstantWrapperProps<T> = { valueState: T }

export type CreateStrictConstantEnvironmentOutput<T> = {
  hook: () => T
  wrapper: FC<PropsWithChildren<ConstantWrapperProps<T>>>
}
