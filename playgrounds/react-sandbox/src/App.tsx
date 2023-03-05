import React from 'react'
import { FC } from 'react'
import styled from 'styled-components'

export const App: FC = () => {
  return (
    // <ThemeContextProvider>
    <div>text</div>
    // <Content />
    // </ThemeContextProvider>
  )
}

export const Root = styled.footer`
  color: var(--primary);
  background-color: var(--secondary);
`

// const Content: FC = () => {
//   const { setTheme } = useTheme()
//
//   return (
//     <>
//       <div>text</div>
//       <button onClick={() => setTheme('main')}>main</button>
//       <button onClick={() => setTheme('additional')}>additional</button>
//     </>
//   )
// }
