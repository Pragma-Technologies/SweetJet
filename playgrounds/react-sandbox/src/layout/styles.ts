import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  padding: 50px 100px;
  margin: 0 auto;
`

export const Header = styled.div`
  display: flex;
  gap: 20px;
`

export const LinkButton = styled(Link)`
  & > span {
    font-size: 16px;
    font-weight: 500;
  }
`
