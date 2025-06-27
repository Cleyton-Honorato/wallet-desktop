import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useFixedExpenseStore } from '../stores/fixedExpenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { FixedExpense, CreateFixedExpenseData } from '../types/expense'
import { Calendar, DollarSign } from 'lucide-react'

interface FixedExpenseDialogProps {
  expense?: FixedExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FixedExpenseDialog({ expense, open, onOpenChange }: FixedExpenseDialogProps) {
  const [formData, setFormData] = useState<CreateFixedExpenseData>({
    title: '',
    amount: 0,
    category: '',
    description: '',
    dueDay: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  const { addFixedExpense, updateFixedExpense } = useFixedExpenseStore()
  const { categories } = useCategoryStore()

  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        description: expense.description || '',
        dueDay: expense.dueDay,
        startDate: expense.startDate.split('T')[0],
        endDate: expense.endDate ? expense.endDate.split('T')[0] : '',
      })
    } else {
      setFormData({
        title: '',
        amount: 0,
        category: '',
        description: '',
        dueDay: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      })
    }
  }, [expense, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.category || formData.amount <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const expenseData: CreateFixedExpenseData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    }

    if (expense) {
      updateFixedExpense(expense.id, expenseData)
    } else {
      addFixedExpense(expenseData)
    }

    onOpenChange(false)
  }

  const handleInputChange = (field: keyof CreateFixedExpenseData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Gerar opções de dias do mês
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {expense ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Aluguel, Internet, Energia..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Valor *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDay">Dia do Vencimento *</Label>
              <Select
                value={formData.dueDay.toString()}
                onValueChange={(value) => handleInputChange('dueDay', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      Dia {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">Data de Fim (Opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea
                id="description"
                placeholder="Observações sobre esta despesa..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {expense ? 'Salvar Alterações' : 'Cadastrar Despesa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 