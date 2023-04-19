import { FC } from 'react'
import { useTheme } from '../../services/ThemeService'
import { Root } from './styles'

export const ThemeServiceTest: FC = () => {
  const { setTheme } = useTheme()

  return (
    <>
      <Root>text</Root>
      <button onClick={() => setTheme('main')}>main</button>
      <button onClick={() => setTheme('additional')}>additional</button>
    </>
  )
}
