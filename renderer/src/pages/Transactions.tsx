import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { TransactionDialog } from '../components/TransactionDialog'
import { TransactionCard } from '../components/TransactionCard'
import { TransactionFilters, TransactionFilters as TFilters } from '../components/TransactionFilters'
import { useTransactionStore } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { Plus, TrendingUp, TrendingDown, DollarSign, Receipt, AlertCircle } from 'lucide-react'

export function Transactions() {
  const { transactions, getTotalBalance, getTotalIncome, getTotalExpenses } = useTransactionStore()
  const { categories, initializeDefaultCategories } = useCategoryStore()
  
  const [filters, setFilters] = useState<TFilters>({
    search: '',
    type: 'all',
    category: '',
    dateFrom: '',
    dateTo: ''
  })

  // Inicializar categorias padrão se não existirem
  useEffect(() => {
    initializeDefaultCategories()
  }, [initializeDefaultCategories])

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filtro de pesquisa
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (
          !transaction.title.toLowerCase().includes(searchTerm) &&
          !transaction.description?.toLowerCase().includes(searchTerm)
        ) {
          return false
        }
      }

      // Filtro de tipo
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false
      }

      // Filtro de categoria
      if (filters.category && transaction.category !== filters.category) {
        return false
      }

      // Filtro de data
      if (filters.dateFrom || filters.dateTo) {
        const transactionDate = new Date(transaction.date)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null

        if (fromDate && transactionDate < fromDate) return false
        if (toDate && transactionDate > toDate) return false
      }

      return true
    })
  }, [transactions, filters])

  // Ordenar transações por data (mais recentes primeiro)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [filteredTransactions])

  // Estatísticas das transações filtradas
  const filteredStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    return {
      income,
      expenses,
      balance: income - expenses,
      count: filteredTransactions.length
    }
  }, [filteredTransactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const totalBalance = getTotalBalance()
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas transações financeiras
          </p>
        </div>
        
        <TransactionDialog />
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Total de receitas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'income').length} receita{transactions.filter(t => t.type === 'income').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Total de despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.type === 'expense').length} despesa{transactions.filter(t => t.type === 'expense').length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Estatísticas filtradas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtros Aplicados</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              filteredStats.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(filteredStats.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredStats.count} de {transactions.length} transação{filteredStats.count !== 1 ? 'ões' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <TransactionFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Lista de transações */}
      <div className="space-y-4">
        {/* Cabeçalho da lista */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {filteredStats.count === transactions.length 
                ? 'Todas as Transações' 
                : 'Transações Filtradas'
              }
            </h2>
            {filteredStats.count !== transactions.length && (
              <Badge variant="secondary">
                {filteredStats.count} de {transactions.length}
              </Badge>
            )}
          </div>
          
          {filteredStats.count > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="text-green-600">+{formatCurrency(filteredStats.income)}</span>
              {' / '}
              <span className="text-red-600">-{formatCurrency(filteredStats.expenses)}</span>
            </div>
          )}
        </div>

        {/* Transações */}
        {sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              {transactions.length === 0 ? (
                <>
                  <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comece criando sua primeira transação para controlar suas finanças.
                  </p>
                  <TransactionDialog 
                    trigger={
                      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        <Plus className="w-4 h-4" />
                        Criar primeira transação
                      </button>
                    }
                  />
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma transação encontrada</h3>
                  <p className="text-muted-foreground text-center">
                    Nenhuma transação corresponde aos filtros aplicados.
                    <br />
                    Tente ajustar os filtros ou limpar a pesquisa.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {sortedTransactions.map((transaction) => (
              <TransactionCard 
                key={transaction.id} 
                transaction={transaction} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 