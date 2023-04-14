import { FC } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { API_TEST_PAGE } from './core/constants/routers'
import { Layout } from './layout'
import { ApiTestPage } from './pages/apiTest'
import { ThemeServiceTest } from './pages/themeServiceTest'
import { ThemeContextProvider } from './services/ThemeService'

export const App: FC = () => {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/*" element={<ThemeServiceTest />} />
            <Route path={API_TEST_PAGE} element={<ApiTestPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeContextProvider>
  )
}
