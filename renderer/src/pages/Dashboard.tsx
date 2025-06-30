import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, ArrowRight, Calendar, PieChart, Clock, Plus, CheckCircle, AlertTriangle, XCircle, CalendarClock, PiggyBank } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useFixedExpenseStore } from '../stores/fixedExpenseStore'
import { useFixedIncomeStore } from '../stores/fixedIncomeStore'
import { useVariableIncomeStore } from '../stores/variableIncomeStore'
import { CategoryIcon } from '../components/CategoryIcon'
import { TransactionDialog } from '../components/TransactionDialog'
import { Button } from '../components/ui/button'
import { format, subDays, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Dashboard() {
  const { transactions, getTotalBalance, getTotalIncome, getTotalExpenses } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { getMonthlyExpenseStats, getRemainingInstallments, getExpenseStatus } = useFixedExpenseStore()
  const { getMonthlyTotal: getFixedIncomeMonthlyTotal, getActiveIncomes } = useFixedIncomeStore()
  const { getMonthlyEstimatedTotal, getMonthlyActualTotal, getIncomesByMonth } = useVariableIncomeStore()
  
  const totalBalance = getTotalBalance()
  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()

  // Estatísticas das receitas
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const fixedIncomeMonthlyTotal = getFixedIncomeMonthlyTotal()
  const variableIncomeEstimated = getMonthlyEstimatedTotal(currentMonth)
  const variableIncomeActual = getMonthlyActualTotal(currentMonth)
  const activeFixedIncomes = getActiveIncomes()
  const currentMonthVariableIncomes = getIncomesByMonth(currentMonth)

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

  // Estatísticas das despesas fixas do mês atual
  const monthlyExpenseStats = getMonthlyExpenseStats()

  // Função para obter o badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paga
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Vencida
          </span>
        )
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <CalendarClock className="w-3 h-3 mr-1" />
            A Vencer
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Inativa
          </span>
        )
    }
  }

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

      {/* Visão Geral das Despesas Fixas do Mês */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Despesas Fixas do Mês</h2>
          <p className="text-sm text-muted-foreground">
            Status das suas despesas fixas para {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {monthlyExpenseStats.paidExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyExpenseStats.paidAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {monthlyExpenseStats.overdueExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyExpenseStats.overdueAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Vencer</CardTitle>
              <CalendarClock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {monthlyExpenseStats.upcomingExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyExpenseStats.upcomingAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {monthlyExpenseStats.totalExpenses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(monthlyExpenseStats.totalAmount)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes das Despesas Vencidas e A Vencer */}
        {(monthlyExpenseStats.overdueExpenses.length > 0 || monthlyExpenseStats.upcomingExpenses.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Despesas Vencidas */}
            {monthlyExpenseStats.overdueExpenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-red-600">
                    Despesas Vencidas ({monthlyExpenseStats.overdueExpenses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyExpenseStats.overdueExpenses.slice(0, 3).map(expense => {
                      const category = categories.find(c => c.id === expense.category)
                      const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), expense.dueDay)
                      
                      return (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {category && (
                              <CategoryIcon 
                                icon={category.icon} 
                                color={category.color}
                                className="w-6 h-6"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{expense.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Venceu em {format(dueDate, "dd/MM")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-red-600 text-sm">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    {monthlyExpenseStats.overdueExpenses.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        E mais {monthlyExpenseStats.overdueExpenses.length - 3} despesas vencidas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximas Despesas */}
            {monthlyExpenseStats.upcomingExpenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-orange-600">
                    Próximas a Vencer ({monthlyExpenseStats.upcomingExpenses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyExpenseStats.upcomingExpenses
                      .sort((a, b) => a.dueDay - b.dueDay)
                      .slice(0, 3)
                      .map(expense => {
                        const category = categories.find(c => c.id === expense.category)
                        const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), expense.dueDay)
                        
                        return (
                          <div key={expense.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {category && (
                                <CategoryIcon 
                                  icon={category.icon} 
                                  color={category.color}
                                  className="w-6 h-6"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm">{expense.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Vence em {format(dueDate, "dd/MM")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-orange-600 text-sm">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    {monthlyExpenseStats.upcomingExpenses.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        E mais {monthlyExpenseStats.upcomingExpenses.length - 3} despesas a vencer
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Tabela Detalhada das Despesas Fixas */}
      {monthlyExpenseStats.totalExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Despesas Fixas do Mês - Detalhado</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todas as despesas fixas para {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Despesa</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Categoria</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Valor</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Vencimento</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Parcelas Restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyExpenseStats.totalExpenses
                    .sort((a, b) => a.dueDay - b.dueDay)
                    .map(expense => {
                      const category = categories.find(c => c.id === expense.category)
                      const status = getExpenseStatus(expense)
                      const remainingInstallments = getRemainingInstallments(expense)
                      const dueDate = new Date(new Date().getFullYear(), new Date().getMonth(), expense.dueDay)
                      
                      // Ajusta se o dia não existe no mês
                      if (dueDate.getMonth() !== new Date().getMonth()) {
                        dueDate.setDate(0)
                      }

                      return (
                        <tr key={expense.id} className="border-b hover:bg-muted/50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-sm">{expense.title}</p>
                              {expense.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {expense.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {category && (
                              <div className="flex items-center gap-2">
                                <CategoryIcon 
                                  icon={category.icon} 
                                  color={category.color}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm">{category.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-medium text-sm">
                              {formatCurrency(expense.amount)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm">
                              <p className="font-medium">
                                {format(dueDate, "dd/MM")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Dia {expense.dueDay}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {getStatusBadge(status)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm">
                              {remainingInstallments !== null ? (
                                <>
                                  <p className="font-medium">
                                    {remainingInstallments} {remainingInstallments === 1 ? 'mês' : 'meses'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    até {format(new Date(expense.endDate!), "MM/yyyy")}
                                  </p>
                                </>
                              ) : (
                                <span className="text-muted-foreground">Indefinido</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
            
            {/* Resumo da tabela */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {monthlyExpenseStats.paidExpenses.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pagas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {monthlyExpenseStats.overdueExpenses.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Vencidas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {monthlyExpenseStats.upcomingExpenses.length}
                  </p>
                  <p className="text-xs text-muted-foreground">A Vencer</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(monthlyExpenseStats.totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visão Geral das Receitas do Mês */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Receitas do Mês</h2>
          <p className="text-sm text-muted-foreground">
            Status das suas receitas para {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas Fixas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(fixedIncomeMonthlyTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeFixedIncomes.length} receitas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variáveis Estimado</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(variableIncomeEstimated)}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMonthVariableIncomes.length} receitas cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Variáveis Realizadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(variableIncomeActual)}
              </div>
              <p className="text-xs text-muted-foreground">
                {currentMonthVariableIncomes.filter(i => i.isReceived).length} recebidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(fixedIncomeMonthlyTotal + variableIncomeActual)}
              </div>
              <p className="text-xs text-muted-foreground">
                Fixas + Variáveis realizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Receitas Variáveis Pendentes */}
        {currentMonthVariableIncomes.filter(i => !i.isReceived).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-orange-600">
                Receitas Variáveis Pendentes ({currentMonthVariableIncomes.filter(i => !i.isReceived).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMonthVariableIncomes
                  .filter(income => !income.isReceived)
                  .slice(0, 3)
                  .map(income => {
                    const category = categories.find(c => c.id === income.category)
                    
                    return (
                      <div key={income.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {category && (
                            <CategoryIcon 
                              icon={category.icon} 
                              color={category.color}
                              className="w-6 h-6"
                            />
                          )}
                          <div>
                            <p className="font-medium text-sm">{income.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {category?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600 text-sm">
                            {formatCurrency(income.estimatedAmount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Estimado
                          </p>
                        </div>
                      </div>
                    )
                  })}
                {currentMonthVariableIncomes.filter(i => !i.isReceived).length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    E mais {currentMonthVariableIncomes.filter(i => !i.isReceived).length - 3} receitas pendentes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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