import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Plus, Edit2, Trash2, DollarSign, Calendar, TrendingUp, Check, Undo2, Tag } from 'lucide-react'
import { useVariableIncomeStore } from '../stores/variableIncomeStore'
import { useCategoryStore } from '../stores/categoryStore'
import { VariableIncomeDialog } from '../components/VariableIncomeDialog'
import { formatCurrency } from '../lib/utils'
import type { VariableIncome } from '../types/income'

export function VariableIncomes() {
  const [selectedIncome, setSelectedIncome] = useState<VariableIncome | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)
  const [receiveIncomeId, setReceiveIncomeId] = useState<string>('')
  const [actualAmount, setActualAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date()
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  })

  const {
    variableIncomes,
    removeVariableIncome,
    markAsReceived,
    undoReceived,
    getIncomesByMonth,
    getMonthlyEstimatedTotal,
    getMonthlyActualTotal,
    duplicateIncomeToNextMonth,
  } = useVariableIncomeStore()

  const { categories } = useCategoryStore()

  const handleEdit = (income: VariableIncome) => {
    setSelectedIncome(income)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      removeVariableIncome(id)
    }
  }

  const handleReceiveIncome = (incomeId: string) => {
    setReceiveIncomeId(incomeId)
    const income = variableIncomes.find(i => i.id === incomeId)
    setActualAmount(income?.estimatedAmount.toString() || '')
    setIsReceiveDialogOpen(true)
  }

  const handleConfirmReceive = () => {
    const amount = parseFloat(actualAmount)
    if (!amount || amount <= 0) {
      alert('Por favor, insira um valor válido')
      return
    }

    markAsReceived(receiveIncomeId, amount)
    setIsReceiveDialogOpen(false)
    setReceiveIncomeId('')
    setActualAmount('')
  }

  const handleUndoReceive = (incomeId: string) => {
    if (confirm('Tem certeza que deseja desfazer esta receita? Isso removerá a transação associada.')) {
      undoReceived(incomeId)
    }
  }

  const handleDuplicate = (incomeId: string) => {
    duplicateIncomeToNextMonth(incomeId)
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Categoria não encontrada'
  }

  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()
    
    // Adiciona 6 meses anteriores
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      options.push({ value: monthKey, label: monthName })
    }
    
    // Adiciona 6 meses futuros
    for (let i = 1; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      options.push({ value: monthKey, label: monthName })
    }
    
    return options
  }

  const monthlyIncomes = getIncomesByMonth(selectedMonth)
  const estimatedTotal = getMonthlyEstimatedTotal(selectedMonth)
  const actualTotal = getMonthlyActualTotal(selectedMonth)
  const receivedIncomes = monthlyIncomes.filter(income => income.isReceived)
  const pendingIncomes = monthlyIncomes.filter(income => !income.isReceived)

  const monthOptions = generateMonthOptions()
  const selectedMonthName = monthOptions.find(option => option.value === selectedMonth)?.label || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas Variáveis</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas ocasionais e extras
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita Variável
        </Button>
      </div>

      {/* Seletor de Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-64">
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
        </CardContent>
      </Card>

      {/* Resumo do Mês */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
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
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(actualTotal)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebidas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedIncomes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingIncomes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Receitas Pendentes */}
      {pendingIncomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas Pendentes - {selectedMonthName}</CardTitle>
            <CardDescription>
              Receitas que ainda não foram recebidas neste mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{income.title}</h3>
                      <Badge variant="outline">
                        {getCategoryName(income.category)}
                      </Badge>
                      {(income.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {income.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {income.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(income.estimatedAmount)}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReceiveIncome(income.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Receber
                      </Button>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDuplicate(income.id)}
                        title="Duplicar para próximo mês"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receitas Recebidas */}
      {receivedIncomes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas Recebidas - {selectedMonthName}</CardTitle>
            <CardDescription>
              Receitas que já foram recebidas neste mês
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivedIncomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 dark:bg-green-900/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{income.title}</h3>
                      <Badge variant="outline">
                        {getCategoryName(income.category)}
                      </Badge>
                      <Badge variant="default" className="bg-green-600">
                        Recebida
                      </Badge>
                      {(income.tags || []).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {income.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {income.description}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Estimado: {formatCurrency(income.estimatedAmount)}
                      </span>
                      <span className="text-green-600 font-medium">
                        Realizado: {formatCurrency(income.actualAmount || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(income.actualAmount || 0)}
                    </span>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUndoReceive(income.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Desfazer
                      </Button>
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
      {monthlyIncomes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhuma receita variável em {selectedMonthName}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Cadastre receitas extras como vendas, freelances, etc.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Receita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para adicionar/editar receita */}
      <VariableIncomeDialog
        income={selectedIncome}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedIncome(null)
        }}
      />

      {/* Dialog para receber receita */}
      <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receber Receita</DialogTitle>
            <DialogDescription>
              Informe o valor real recebido para esta receita
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="actualAmount">Valor Recebido</Label>
              <Input
                id="actualAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsReceiveDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleConfirmReceive}>
                Confirmar Recebimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 