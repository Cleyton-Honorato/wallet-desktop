import { useState } from 'react'
import { Plus, Calendar, DollarSign, Edit2, Trash2, Power, PowerOff, RotateCcw, Eye, CreditCard } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useFixedExpenseStore } from '../stores/fixedExpenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { FixedExpenseDialog } from '../components/FixedExpenseDialog'
import { formatCurrency } from '../lib/utils'
import { FixedExpense } from '../types/expense'

export function FixedExpenses() {
  const [selectedExpense, setSelectedExpense] = useState<FixedExpense | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
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
  
  const { categories } = useCategoryStore()

  const handleEdit = (expense: FixedExpense) => {
    setSelectedExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      removeFixedExpense(id)
    }
  }

  const handlePayExpense = (expense: FixedExpense) => {
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
    const activeExpensesCount = activeExpenses.length
    
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  const activeExpenses = fixedExpenses.filter(expense => expense.isActive)
  const inactiveExpenses = fixedExpenses.filter(expense => !expense.isActive)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const processedExpensesThisMonth = getProcessedExpensesInMonth(currentMonth)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Despesas Fixas</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas recorrentes mensais
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Despesa Fixa
          </Button>
        </div>
      </div>

      {/* Resumo */}
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
            <div className="text-2xl font-bold">{activeExpenses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Inativas</CardTitle>
            <PowerOff className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveExpenses.length}</div>
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
      {activeExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas Ativas</CardTitle>
            <CardDescription>
              Despesas que serão incluídas na geração automática de transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeExpenses.map((expense) => (
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
                          onClick={() => handlePayExpense(expense)}
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

      {/* Lista de Despesas Inativas */}
      {inactiveExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas Inativas</CardTitle>
            <CardDescription>
              Despesas pausadas que não serão incluídas na geração de transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveExpenses.map((expense) => (
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
      {fixedExpenses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma despesa fixa cadastrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre suas despesas recorrentes para facilitar o controle financeiro
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Despesa
            </Button>
          </CardContent>
        </Card>
      )}

      <FixedExpenseDialog
        expense={selectedExpense}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedExpense(null)
        }}
      />
    </div>
  )
} 