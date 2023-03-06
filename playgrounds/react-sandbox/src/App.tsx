import React, { FC } from 'react'
import { ThemeContextProvider, useTheme } from './services/ThemeService'
import styled from 'styled-components'

export const App: FC = () => {
  return (
    <ThemeContextProvider>
      <Content />
    </ThemeContextProvider>
  )
}

export const Root = styled.footer`
  color: var(--primary);
  background-color: var(--secondary);
`

const Content: FC = () => {
  const { setTheme } = useTheme()

  return (
    <>
      <Root>text</Root>
      <button onClick={() => setTheme('main')}>main</button>
      <button onClick={() => setTheme('additional')}>additional</button>
    </>
  )
}
