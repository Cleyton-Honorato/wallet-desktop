import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Categories } from './pages/Categories'
import { Expenses } from './pages/Expenses'
import { Incomes } from './pages/Incomes'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wallet-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App 