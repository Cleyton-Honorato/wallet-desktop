import { useState } from 'react'
import { Plus, Calendar, DollarSign, Edit2, Trash2, Power, PowerOff, RotateCcw, Eye, CreditCard, TrendingUp, Check, Copy, Undo2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useFixedExpenseStore } from '../stores/fixedExpenseStore'
import { useVariableExpenseStore } from '../stores/variableExpenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { FixedExpenseDialog } from '../components/FixedExpenseDialog'
import { VariableExpenseDialog } from '../components/VariableExpenseDialog'
import { formatCurrency } from '../lib/utils'
import { FixedExpense, VariableExpense } from '../types/expense'

export function Expenses() {
  const [activeTab, setActiveTab] = useState('fixed')
  
  // Fixed Expense State
  const [selectedFixedExpense, setSelectedFixedExpense] = useState<FixedExpense | null>(null)
  const [isFixedDialogOpen, setIsFixedDialogOpen] = useState(false)

  // Variable Expense State
  const [selectedVariableExpense, setSelectedVariableExpense] = useState<VariableExpense | null>(null)
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentExpense, setPaymentExpense] = useState<VariableExpense | null>(null)
  const [actualAmount, setActualAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date()
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  })

  // Fixed Expense Store
  const { 
    fixedExpenses, 
    removeFixedExpense, 
    toggleExpenseStatus,
    getTotalMonthlyAmount,
    generateMonthlyTransactions,
    getProcessedExpensesInMonth,
    clearGeneratedTransactionsForMonth,
    deleteTransactionAndControl,
    createTransactionForExpense
  } = useFixedExpenseStore()

  // Variable Expense Store
  const {
    variableExpenses,
    removeVariableExpense,
    markAsCompleted,
    undoCompleted,
    getExpensesByMonth,
    getMonthlyEstimatedTotal,
    getMonthlyActualTotal,
    getCompletedExpenses,
    getPendingExpenses,
    duplicateExpenseToNextMonth
  } = useVariableExpenseStore()
  
  const { categories } = useCategoryStore()

  // Fixed Expense Handlers
  const handleEditFixed = (expense: FixedExpense) => {
    setSelectedFixedExpense(expense)
    setIsFixedDialogOpen(true)
  }

  const handleDeleteFixed = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      removeFixedExpense(id)
    }
  }

  const handlePayFixedExpense = (expense: FixedExpense) => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    // Verifica se já foi processada
    if (getProcessedExpensesInMonth(currentMonth).some(p => p.expenseId === expense.id)) {
      alert('Esta despesa já foi paga neste mês!')
      return
    }
    
    const success = createTransactionForExpense(expense.id, currentMonth)
    
    if (success) {
      alert(`✅ Transação criada com sucesso para ${expense.title}!`)
    } else {
      alert(`❌ Não foi possível criar a transação para ${expense.title}. Verifique se a despesa está ativa e no período correto.`)
    }
  }

  const handleGenerateTransactions = () => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const activeExpensesCount = activeFixedExpenses.length
    
    if (activeExpensesCount === 0) {
      alert('Não há despesas fixas ativas para gerar transações.')
      return
    }
    
    console.log(`Gerando transações para ${activeExpensesCount} despesas fixas do mês ${currentMonth}`)
    const createdCount = generateMonthlyTransactions(currentMonth)
    
    if (createdCount === 0) {
      alert('⚠️ Nenhuma transação foi criada. Pode ser que já existam transações para este mês ou as despesas não estejam no período ativo.')
    } else {
      alert(`✅ ${createdCount} transação(ões) foi(ram) gerada(s) com sucesso para o mês atual!`)
    }
  }

  const handleClearMonthTransactions = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const processedCount = getProcessedExpensesInMonth(currentMonth).length
    
    if (processedCount === 0) {
      alert('Não há transações geradas para remover neste mês.')
      return
    }
    
    if (confirm(`Tem certeza que deseja remover todas as ${processedCount} transações geradas neste mês?`)) {
      const removedCount = clearGeneratedTransactionsForMonth(currentMonth)
      alert(`✅ ${removedCount} transação(ões) removida(s) com sucesso!`)
    }
  }

  const handleRemoveExpenseTransaction = (expenseId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    if (confirm('Tem certeza que deseja remover a transação gerada desta despesa?')) {
      const success = deleteTransactionAndControl(expenseId, currentMonth)
      if (success) {
        alert('✅ Transação removida com sucesso!')
      } else {
        alert('❌ Nenhuma transação encontrada para esta despesa no mês atual.')
      }
    }
  }

  // Variable Expense Handlers
  const handleEditVariable = (expense: VariableExpense) => {
    setSelectedVariableExpense(expense)
    setIsVariableDialogOpen(true)
  }

  const handleDeleteVariable = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa variada?')) {
      removeVariableExpense(id)
    }
  }

  const handlePayVariableExpense = (expense: VariableExpense) => {
    setPaymentExpense(expense)
    setActualAmount(expense.estimatedAmount.toString())
    setIsPaymentDialogOpen(true)
  }

  const handleConfirmPayment = () => {
    if (paymentExpense && actualAmount && !isNaN(Number(actualAmount))) {
      markAsCompleted(paymentExpense.id, Number(actualAmount))
      setIsPaymentDialogOpen(false)
      setPaymentExpense(null)
      setActualAmount('')
    }
  }

  const handleUndoCompleted = (id: string) => {
    if (confirm('Tem certeza que deseja desfazer esta despesa? Isso removerá a transação associada.')) {
      undoCompleted(id)
    }
  }

  // Common Helpers
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  const generateMonthOptions = () => {
    const options = []
    const today = new Date()
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      })
      
      options.push({ value: monthKey, label: monthLabel })
    }
    
    return options
  }

  // Fixed Expense Data
  const activeFixedExpenses = fixedExpenses.filter(expense => expense.isActive)
  const inactiveFixedExpenses = fixedExpenses.filter(expense => !expense.isActive)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const processedExpensesThisMonth = getProcessedExpensesInMonth(currentMonth)

  // Variable Expense Data
  const monthExpenses = getExpensesByMonth(selectedMonth)
  const completedExpenses = getCompletedExpenses(selectedMonth)
  const pendingExpenses = getPendingExpenses(selectedMonth)
  const estimatedTotal = getMonthlyEstimatedTotal(selectedMonth)
  const actualTotal = getMonthlyActualTotal(selectedMonth)
  const monthOptions = generateMonthOptions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas fixas e variáveis
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Despesas Fixas ({activeFixedExpenses.length + inactiveFixedExpenses.length})
          </TabsTrigger>
          <TabsTrigger value="variable" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Despesas Variáveis
          </TabsTrigger>
        </TabsList>

        {/* Fixed Expenses Tab */}
        <TabsContent value="fixed" className="space-y-6">
          <div className="flex gap-2 justify-end">
            <Button onClick={handleGenerateTransactions} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Gerar Transações do Mês
            </Button>
            {processedExpensesThisMonth.length > 0 && (
              <Button onClick={handleClearMonthTransactions} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar Transações do Mês
              </Button>
            )}
            <Button onClick={() => setIsFixedDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa Fixa
            </Button>
          </div>

          {/* Fixed Expense Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(getTotalMonthlyAmount())}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Ativas</CardTitle>
                <Power className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeFixedExpenses.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Inativas</CardTitle>
                <PowerOff className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inactiveFixedExpenses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transações Geradas</CardTitle>
                <Eye className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{processedExpensesThisMonth.length}</div>
                <p className="text-xs text-muted-foreground">
                  no mês atual
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Despesas Ativas */}
          {activeFixedExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Despesas Ativas</CardTitle>
                <CardDescription>
                  Despesas que serão incluídas na geração automática de transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeFixedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.title}</h3>
                          <Badge variant="secondary">
                            Dia {expense.dueDay}
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                          {processedExpensesThisMonth.some(p => p.expenseId === expense.id) && (
                            <Badge variant="default" className="bg-blue-600">
                              Processada
                            </Badge>
                          )}
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-red-600">
                          {formatCurrency(expense.amount)}
                        </span>
                        
                        <div className="flex gap-2">
                          {processedExpensesThisMonth.some(p => p.expenseId === expense.id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveExpenseTransaction(expense.id)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePayFixedExpense(expense)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleExpenseStatus(expense.id)}
                          >
                            <PowerOff className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditFixed(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteFixed(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Despesas Inativas */}
          {inactiveFixedExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Despesas Inativas</CardTitle>
                <CardDescription>
                  Despesas pausadas que não serão incluídas na geração de transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inactiveFixedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg opacity-60"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.title}</h3>
                          <Badge variant="secondary">
                            Dia {expense.dueDay}
                          </Badge>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                          <Badge variant="destructive">Inativa</Badge>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {formatCurrency(expense.amount)}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleExpenseStatus(expense.id)}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditFixed(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteFixed(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado vazio para despesas fixas */}
          {fixedExpenses.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma despesa fixa cadastrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Cadastre suas despesas recorrentes para facilitar o controle financeiro
                </p>
                <Button onClick={() => setIsFixedDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Despesa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Variable Expenses Tab */}
        <TabsContent value="variable" className="space-y-6">
          <div className="flex gap-2 items-center justify-end">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsVariableDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Despesa Variável
            </Button>
          </div>

          {/* Variable Expense Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimado</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estimatedTotal)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Realizado</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(actualTotal)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <Check className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedExpenses.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingExpenses.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Despesas Pendentes */}
          {pendingExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Despesas Pendentes</CardTitle>
                <CardDescription>
                  Despesas planejadas que ainda não foram realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.title}</h3>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                          {expense.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-blue-600">
                          {formatCurrency(expense.estimatedAmount)}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handlePayVariableExpense(expense)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateExpenseToNextMonth(expense.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditVariable(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVariable(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Despesas Concluídas */}
          {completedExpenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Despesas Concluídas</CardTitle>
                <CardDescription>
                  Despesas que já foram realizadas no mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{expense.title}</h3>
                          <Badge variant="outline">
                            {getCategoryName(expense.category)}
                          </Badge>
                          <Badge variant="default" className="bg-green-600">
                            Concluída
                          </Badge>
                          {expense.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {expense.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-blue-600">
                            Estimado: {formatCurrency(expense.estimatedAmount)}
                          </span>
                          <span className="text-red-600">
                            Real: {formatCurrency(expense.actualAmount || 0)}
                          </span>
                          <span className={
                            (expense.actualAmount || 0) <= expense.estimatedAmount 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            Diferença: {formatCurrency((expense.actualAmount || 0) - expense.estimatedAmount)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-red-600">
                          {formatCurrency(expense.actualAmount || 0)}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoCompleted(expense.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Undo2 className="h-4 w-4" />
                            Desfazer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => duplicateExpenseToNextMonth(expense.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditVariable(expense)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteVariable(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estado vazio para despesas variáveis */}
          {monthExpenses.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Nenhuma despesa variável para {monthOptions.find(m => m.value === selectedMonth)?.label}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Cadastre suas despesas não recorrentes para este mês
                </p>
                <Button onClick={() => setIsVariableDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Despesa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <FixedExpenseDialog
        expense={selectedFixedExpense}
        open={isFixedDialogOpen}
        onOpenChange={(open) => {
          setIsFixedDialogOpen(open)
          if (!open) setSelectedFixedExpense(null)
        }}
      />

      <VariableExpenseDialog
        expense={selectedVariableExpense}
        open={isVariableDialogOpen}
        onOpenChange={(open) => {
          setIsVariableDialogOpen(open)
          if (!open) setSelectedVariableExpense(null)
        }}
        defaultMonth={selectedMonth}
      />

      {/* Dialog de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Despesa</DialogTitle>
            <DialogDescription>
              Informe o valor real gasto para "{paymentExpense?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="actual-amount">Valor Real</Label>
              <Input
                id="actual-amount"
                type="number"
                step="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="0,00"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Valor estimado: {paymentExpense && formatCurrency(paymentExpense.estimatedAmount)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={!actualAmount || isNaN(Number(actualAmount))}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 