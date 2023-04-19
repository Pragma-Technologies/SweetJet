import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Root = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`

export const LinkButton = styled(Link)`
  & > span {
    font-size: 16px;
    font-weight: 500;
  }
`
export const LinkContainer = styled.div`
  display: flex;
  gap: 10px;
`
