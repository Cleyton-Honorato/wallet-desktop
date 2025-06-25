import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, Calendar, PieChart, Clock, Plus } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { CategoryIcon } from '../components/CategoryIcon'
import { TransactionDialog } from '../components/TransactionDialog'
import { Button } from '../components/ui/button'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Dashboard() {
  const { transactions, getTotalBalance, getTotalIncome, getTotalExpenses } = useTransactionStore()
  const { categories } = useCategoryStore()
  
  const totalBalance = getTotalBalance()
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Calcular estatísticas dos últimos 30 dias
  const last30Days = subDays(new Date(), 30)
  const recentTransactions = transactions
    .filter(t => isAfter(new Date(t.date), last30Days))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const last30DaysStats = {
    income: recentTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
    expenses: recentTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  }

  // Calcular top categorias
  const categoryStats = transactions.reduce((acc, transaction) => {
    const category = categories.find(c => c.id === transaction.category)
    if (!category) return acc

    if (!acc[category.id]) {
      acc[category.id] = {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        total: 0,
        count: 0,
      }
    }

    acc[category.id].total += transaction.amount
    acc[category.id].count += 1
    return acc
  }, {} as Record<string, { id: string; name: string; icon: string; color: string; type: string; total: number; count: number }>)

  const topCategories = Object.values(categoryStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
        <TransactionDialog />
      </div>

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Saldo atual da carteira
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Últimos 30 dias:</span>
              <span className="text-sm font-medium text-green-600">
                +{formatCurrency(last30DaysStats.income)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Últimos 30 dias:</span>
              <span className="text-sm font-medium text-red-600">
                -{formatCurrency(last30DaysStats.expenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Categorias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Top Categorias</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Categorias mais movimentadas
              </p>
            </div>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(category => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CategoryIcon 
                      icon={category.icon} 
                      color={category.color}
                      className="w-8 h-8"
                    />
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.count} transaç{category.count === 1 ? 'ão' : 'ões'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      category.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {category.type === 'income' ? '+' : '-'}{formatCurrency(category.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Últimas Transações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Últimas Transações</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Transações mais recentes
              </p>
            </div>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map(transaction => {
                const category = categories.find(c => c.id === transaction.category)
                if (!category) return null

                return (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CategoryIcon 
                        icon={category.icon} 
                        color={category.color}
                        className="w-8 h-8"
                      />
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                )
              })}

              {recentTransactions.length > 5 && (
                <Button variant="outline" className="w-full" asChild>
                  <a href="/transactions">
                    Ver todas as transações
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}

              {recentTransactions.length === 0 && (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transação nos últimos 30 dias
                  </p>
                  <TransactionDialog
                    trigger={
                      <Button className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar primeira transação
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 