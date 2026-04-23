import './App.css'
import AdminPage from './routes/AdminPage'
import DisplayPage from './routes/DisplayPage'
import { NotFoundPage } from './routes/RoutePage'
import UserPage from './routes/UserPage'

const routes = {
  '/': UserPage,
  '/admin': AdminPage,
  '/display': DisplayPage,
}

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }

  return pathname
}

function App() {
  const Page = routes[normalizePath(window.location.pathname) as keyof typeof routes]

  if (!Page) {
    return <NotFoundPage />
  }

  return <Page />
}

export default App
