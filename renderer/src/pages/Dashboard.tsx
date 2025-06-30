import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { DollarSign, TrendingUp, TrendingDown, Calendar, CheckCircle, XCircle, CalendarClock, AlertTriangle, Clock, Plus } from 'lucide-react'
import { useTransactionStore } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useFixedExpenseStore } from '../stores/fixedExpenseStore'
import { useFixedIncomeStore } from '../stores/fixedIncomeStore'
import { useVariableIncomeStore } from '../stores/variableIncomeStore'
import { useVariableExpenseStore } from '../stores/variableExpenseStore'
import { CategoryIcon } from '../components/CategoryIcon'
import { TransactionDialog } from '../components/TransactionDialog'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function Dashboard() {
  const { getTotalBalance } = useTransactionStore()
  const { categories } = useCategoryStore()
  const { 
    getMonthlyExpenseStats, 
    getExpenseStatus, 
    getRemainingInstallments,
    fixedExpenses,
    getActiveExpenses,
    getTotalMonthlyAmount
  } = useFixedExpenseStore()
  
  const { 
    getExpensesByMonth: getVariableExpensesByMonth, 
    getMonthlyEstimatedTotal: getVariableExpenseEstimatedTotal,
    getMonthlyActualTotal: getVariableExpenseActualTotal,
    getCompletedExpenses: getCompletedVariableExpenses,
    getPendingExpenses: getPendingVariableExpenses
  } = useVariableExpenseStore()

  const { getMonthlyTotal: getFixedIncomeMonthlyTotal, hasTransactionForMonth } = useFixedIncomeStore()
  const { getMonthlyEstimatedTotal, getMonthlyActualTotal, getIncomesByMonth } = useVariableIncomeStore()
  
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const today = new Date()
  
  // Dados essenciais
  const totalBalance = getTotalBalance()
  const monthlyExpenseStats = getMonthlyExpenseStats()
  const fixedIncomeMonthlyTotal = getFixedIncomeMonthlyTotal()
  const variableIncomeActual = getMonthlyActualTotal(currentMonth)
  const variableIncomesPending = getIncomesByMonth(currentMonth).filter(i => !i.isReceived)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Sem categoria'
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? (
      <CategoryIcon 
        icon={category.icon} 
        color={category.color}
        className="w-5 h-5"
      />
    ) : null
  }

  // Despesas próximas do vencimento (próximos 7 dias)
  const upcomingExpenses = monthlyExpenseStats.upcomingExpenses
    .filter(expense => {
      const dueDate = new Date(today.getFullYear(), today.getMonth(), expense.dueDay)
      const nextWeek = addDays(today, 7)
      return isBefore(dueDate, nextWeek) && isAfter(dueDate, today)
    })
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 5)

  // Receitas totais do mês
  const totalMonthlyIncome = fixedIncomeMonthlyTotal + variableIncomeActual
  
  // Saldo projetado (receitas - despesas do mês)
  const projectedBalance = totalMonthlyIncome - monthlyExpenseStats.totalAmount

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <TransactionDialog />
      </div>

      {/* Cards Principais - Visão Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalBalance)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fixas + Variáveis recebidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(monthlyExpenseStats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthlyExpenseStats.paidExpenses.length} de {monthlyExpenseStats.totalExpenses.length} pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(projectedBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status das Despesas - Cards Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Vencidas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Próximos 7 Dias</CardTitle>
            <CalendarClock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {upcomingExpenses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(upcomingExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Pagas</CardTitle>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Despesas Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Ação Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Despesas Vencidas */}
              {monthlyExpenseStats.overdueExpenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">
                    Vencidas ({monthlyExpenseStats.overdueExpenses.length})
                  </h4>
                  <div className="space-y-2">
                    {monthlyExpenseStats.overdueExpenses.slice(0, 3).map(expense => (
                      <div key={expense.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(expense.category)}
                          <div>
                            <p className="font-medium text-sm">{expense.title}</p>
                            <p className="text-xs text-red-600">
                              Venceu dia {expense.dueDay}
                            </p>
                          </div>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Próximos Vencimentos */}
              {upcomingExpenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-orange-600 mb-2">
                    Próximos 7 Dias ({upcomingExpenses.length})
                  </h4>
                  <div className="space-y-2">
                    {upcomingExpenses.map(expense => (
                      <div key={expense.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(expense.category)}
                          <div>
                            <p className="font-medium text-sm">{expense.title}</p>
                            <p className="text-xs text-orange-600">
                              Vence dia {expense.dueDay}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {monthlyExpenseStats.overdueExpenses.length === 0 && upcomingExpenses.length === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma despesa urgente no momento
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receitas Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Receitas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variableIncomesPending.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-blue-600 mb-2">
                    Receitas Variáveis ({variableIncomesPending.length})
                  </h4>
                  <div className="space-y-2">
                    {variableIncomesPending.slice(0, 4).map(income => (
                      <div key={income.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(income.category)}
                          <div>
                            <p className="font-medium text-sm">{income.title}</p>
                            <p className="text-xs text-blue-600">
                              {getCategoryName(income.category)}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(income.estimatedAmount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Todas as receitas foram processadas
                  </p>
                </div>
              )}

              {variableIncomesPending.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  E mais {variableIncomesPending.length - 4} receitas pendentes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
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

      {/* Tabela Detalhada das Despesas Variáveis */}
      {getVariableExpensesByMonth(currentMonth).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Despesas Variáveis do Mês - Detalhado</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todas as despesas variáveis para {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Despesa</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Categoria</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Valor Estimado</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Valor Real</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Diferença</th>
                    <th className="text-center py-3 px-4 font-medium text-sm text-muted-foreground">Tags</th>
                  </tr>
                </thead>
                <tbody>
                  {getVariableExpensesByMonth(currentMonth)
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map(expense => {
                      const category = categories.find(c => c.id === expense.category)
                      const difference = expense.isCompleted ? (expense.actualAmount || 0) - expense.estimatedAmount : 0
                      
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
                            <span className="font-medium text-sm text-blue-600">
                              {formatCurrency(expense.estimatedAmount)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-medium text-sm ${
                              expense.isCompleted ? 'text-red-600' : 'text-muted-foreground'
                            }`}>
                              {expense.isCompleted ? formatCurrency(expense.actualAmount || 0) : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {expense.isCompleted ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paga
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {expense.isCompleted ? (
                              <span className={`font-medium text-sm ${
                                difference <= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference))}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {(expense.tags || []).slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                              {(expense.tags || []).length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{(expense.tags || []).length - 2}
                                </span>
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
                    {getCompletedVariableExpenses(currentMonth).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pagas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {getPendingVariableExpenses(currentMonth).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(getVariableExpenseEstimatedTotal(currentMonth))}
                  </p>
                  <p className="text-xs text-muted-foreground">Estimado</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(getVariableExpenseActualTotal(currentMonth))}
                  </p>
                  <p className="text-xs text-muted-foreground">Realizado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de {format(today, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Receitas</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Receitas Fixas:</span>
                  <span className="font-medium">{formatCurrency(fixedIncomeMonthlyTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Receitas Variáveis:</span>
                  <span className="font-medium">{formatCurrency(variableIncomeActual)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-1">
                  <span>Total Receitas:</span>
                  <span className="text-green-600">{formatCurrency(totalMonthlyIncome)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-red-600">Despesas</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Despesas Pagas:</span>
                  <span className="font-medium">{formatCurrency(monthlyExpenseStats.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Despesas Pendentes:</span>
                  <span className="font-medium">{formatCurrency(monthlyExpenseStats.totalAmount - monthlyExpenseStats.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t pt-1">
                  <span>Total Despesas:</span>
                  <span className="text-red-600">{formatCurrency(monthlyExpenseStats.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Resultado do Mês:</span>
              <span className={`text-lg font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {projectedBalance >= 0 ? '+' : ''}{formatCurrency(projectedBalance)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 