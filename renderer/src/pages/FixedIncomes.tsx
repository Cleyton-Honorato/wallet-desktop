import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Plus, Edit2, Trash2, DollarSign, Calendar, TrendingUp, Check, Undo2 } from 'lucide-react'
import { useFixedIncomeStore } from '../stores/fixedIncomeStore'
import { useCategoryStore } from '../stores/categoryStore'
import { FixedIncomeDialog } from '../components/FixedIncomeDialog'
import { formatCurrency } from '../lib/utils'
import type { FixedIncome } from '../types/income'

export function FixedIncomes() {
  const [selectedIncome, setSelectedIncome] = useState<FixedIncome | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    fixedIncomes,
    removeFixedIncome,
    getActiveIncomes,
    getMonthlyTotal,
    createTransactionForIncome,
    undoTransactionForIncome,
    hasTransactionForMonth,
  } = useFixedIncomeStore()

  const { categories } = useCategoryStore()

  const handleEdit = (income: FixedIncome) => {
    setSelectedIncome(income)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita? Isso removerá todas as transações associadas.')) {
      removeFixedIncome(id)
    }
  }

  const handleReceiveIncome = (incomeId: string) => {
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    console.log('Tentando criar transação para receita:', incomeId, 'no mês:', currentMonth)
    
    const success = createTransactionForIncome(incomeId, currentMonth)
    if (!success) {
      // Verifica motivos específicos do erro
      const income = fixedIncomes.find(i => i.id === incomeId)
      if (!income) {
        alert('Receita não encontrada.')
        return
      }
      
      if (!income.isActive) {
        alert('Esta receita está inativa. Ative-a primeiro para poder processá-la.')
        return
      }
      
      if (hasTransactionForMonth(incomeId, currentMonth)) {
        alert('Esta receita já foi processada neste mês.')
        return
      }
      
      // Erro genérico
      alert('Não foi possível gerar a transação. Verifique os dados da receita e tente novamente.')
    } else {
      console.log('Transação criada com sucesso!')
    }
  }

  const handleUndoIncome = (incomeId: string) => {
    const currentDate = new Date()
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    
    if (confirm('Tem certeza que deseja desfazer esta receita? Isso removerá a transação associada.')) {
      undoTransactionForIncome(incomeId, currentMonth)
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  const getCurrentMonth = () => {
    const currentDate = new Date()
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  }

  const activeIncomes = getActiveIncomes()
  const inactiveIncomes = fixedIncomes.filter(income => !income.isActive)
  const monthlyTotal = getMonthlyTotal()
  const currentMonth = getCurrentMonth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas Fixas</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas recorrentes mensais
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita Fixa
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(monthlyTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncomes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Inativas</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveIncomes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fixedIncomes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Receitas Ativas */}
      {activeIncomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas Ativas</CardTitle>
            <CardDescription>
              Receitas que estão sendo processadas mensalmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeIncomes.map((income) => {
                const hasTransaction = hasTransactionForMonth(income.id, currentMonth)
                
                return (
                  <div
                    key={income.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      hasTransaction ? 'bg-green-50 dark:bg-green-900/10' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{income.title}</h3>
                        <Badge variant="outline">
                          {getCategoryName(income.category)}
                        </Badge>
                        <Badge variant="outline">
                          Dia {income.receiptDay}
                        </Badge>
                        {hasTransaction && (
                          <Badge variant="default" className="bg-green-600">
                            Processada
                          </Badge>
                        )}
                      </div>
                      {income.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {income.description}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Início: {new Date(income.startDate).toLocaleDateString('pt-BR')}
                        </span>
                        {income.endDate && (
                          <span className="text-muted-foreground">
                            Fim: {new Date(income.endDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(income.amount)}
                      </span>
                      
                      <div className="flex gap-2">
                        {!hasTransaction ? (
                          <Button
                            size="sm"
                            onClick={() => handleReceiveIncome(income.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Receber
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUndoIncome(income.id)}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Undo2 className="h-4 w-4 mr-1" />
                            Desfazer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(income)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Receitas Inativas */}
      {inactiveIncomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas Inativas</CardTitle>
            <CardDescription>
              Receitas que foram pausadas ou finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-muted-foreground">{income.title}</h3>
                      <Badge variant="outline">
                        {getCategoryName(income.category)}
                      </Badge>
                      <Badge variant="secondary">
                        Inativa
                      </Badge>
                    </div>
                    {income.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {income.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-muted-foreground">
                      {formatCurrency(income.amount)}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(income)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(income.id)}
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
      {fixedIncomes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma receita fixa cadastrada
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre suas receitas recorrentes como salário, pensão, etc.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeira Receita
            </Button>
          </CardContent>
        </Card>
      )}

      <FixedIncomeDialog
        income={selectedIncome}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedIncome(null)
        }}
      />
    </div>
  )
} 