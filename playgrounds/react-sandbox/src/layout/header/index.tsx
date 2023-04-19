import { FC } from 'react'
import { API_TEST_PAGE } from '../../core/constants/routers'
import { WalletsConnect } from '../connectButton'
import { LinkButton, LinkContainer, Root } from './styles'

export const Header: FC = () => {
  const navInfo = [
    { title: 'Theme', router: '*' },
    { title: 'Api', router: API_TEST_PAGE },
  ]

  return (
    <Root>
      <LinkContainer>
        {navInfo.map(({ title, router }) => (
          <LinkButton to={router} key={title}>
            <span>{title}</span>
          </LinkButton>
        ))}
      </LinkContainer>
      <WalletsConnect />
    </Root>
  )
}
