import { ReactNode } from 'react'
import { API_TEST_PAGE } from '../core/constants/routers'
import { Header, LinkButton, Root } from './styles'

export const Layout = ({ children }: { children: ReactNode }): JSX.Element => {
  const navInfo = [
    { title: 'Theme', router: '*' },
    { title: 'Api', router: API_TEST_PAGE },
  ]
  return (
    <Root>
      <Header>
        {navInfo.map(({ title, router }) => (
          <LinkButton to={router} key={title}>
            <span>{title}</span>
          </LinkButton>
        ))}
      </Header>
      {children}
    </Root>
  )
}
