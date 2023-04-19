import { ReactNode } from 'react'
import { Header } from './header'
import { Root } from './styles'

export const Layout = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <Root>
      <Header />
      {children}
    </Root>
  )
}
