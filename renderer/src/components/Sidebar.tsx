import { Link, useLocation } from 'react-router-dom'
import { Home, CreditCard, Wallet, Tag, Settings, HelpCircle, Calendar, TrendingUp, DollarSign } from 'lucide-react'
import { cn } from '../lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Transações', href: '/transactions', icon: CreditCard },
  { name: 'Despesas Fixas', href: '/fixed-expenses', icon: Calendar },
  { name: 'Despesas Variadas', href: '/variable-expenses', icon: TrendingUp },
  { name: 'Receitas', href: '/incomes', icon: DollarSign },
  { name: 'Categorias', href: '/categories', icon: Tag },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-64 bg-card border-r border-border">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Wallet App</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 