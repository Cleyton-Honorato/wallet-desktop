import { useState } from 'react'
import { Plus, TrendingUp, DollarSign, Edit2, Trash2, Check, Copy, Calendar, Undo2 } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useVariableExpenseStore } from '../stores/variableExpenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { VariableExpenseDialog } from '../components/VariableExpenseDialog'
import { formatCurrency } from '../lib/utils'
import { VariableExpense } from '../types/expense'

export function VariableExpenses() {
  const [selectedExpense, setSelectedExpense] = useState<VariableExpense | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentExpense, setPaymentExpense] = useState<VariableExpense | null>(null)
  const [actualAmount, setActualAmount] = useState('')
  
  // Mês atual como padrão
  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  
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

  const handleEdit = (expense: VariableExpense) => {
    setSelectedExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa variada?')) {
      removeVariableExpense(id)
    }
  }

  const handlePayExpense = (expense: VariableExpense) => {
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

  const handleMarkCompleted = (id: string) => {
    const expense = variableExpenses.find(e => e.id === id)
    if (!expense) return

    const actualAmount = prompt(
      `Digite o valor real gasto para "${expense.title}":`,
      expense.estimatedAmount.toString()
    )

    if (actualAmount && !isNaN(Number(actualAmount))) {
      markAsCompleted(id, Number(actualAmount))
    }
  }

  const handleUndoCompleted = (id: string) => {
    if (confirm('Tem certeza que deseja desfazer esta despesa? Isso removerá a transação associada.')) {
      undoCompleted(id)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  // Gerar opções de meses (6 meses para trás e 6 para frente)
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
          <h1 className="text-3xl font-bold tracking-tight">Despesas Variadas</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas não recorrentes por mês
          </p>
        </div>
        <div className="flex gap-2 items-center">
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa Variada
          </Button>
        </div>
      </div>

      {/* Resumo do Mês */}
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
                        onClick={() => handlePayExpense(expense)}
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
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(expense.id)}
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
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(expense.id)}
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

      {/* Estado vazio */}
      {monthExpenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma despesa variada para {monthOptions.find(m => m.value === selectedMonth)?.label}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre suas despesas não recorrentes para este mês
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Despesa
            </Button>
          </CardContent>
        </Card>
      )}

      <VariableExpenseDialog
        expense={selectedExpense}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedExpense(null)
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