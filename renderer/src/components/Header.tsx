import { useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transações',
  '/expenses': 'Despesas',
  '/incomes': 'Receitas',
  '/categories': 'Categorias',
}

export function Header() {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Wallet App'

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{pageTitle}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 