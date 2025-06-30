import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './layouts/Layout'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Categories } from './pages/Categories'
import { FixedExpenses } from './pages/FixedExpenses'
import { VariableExpenses } from './pages/VariableExpenses'
import { FixedIncomes } from './pages/FixedIncomes'
import { VariableIncomes } from './pages/VariableIncomes'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wallet-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/fixed-expenses" element={<FixedExpenses />} />
            <Route path="/variable-expenses" element={<VariableExpenses />} />
            <Route path="/fixed-incomes" element={<FixedIncomes />} />
            <Route path="/variable-incomes" element={<VariableIncomes />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App 