import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { useVariableExpenseStore } from '../stores/variableExpenseStore'
import { useCategoryStore } from '../stores/categoryStore'
import { VariableExpense, CreateVariableExpenseData } from '../types/expense'
import { TrendingUp, DollarSign, X, Plus } from 'lucide-react'

interface VariableExpenseDialogProps {
  expense?: VariableExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMonth?: string
}

export function VariableExpenseDialog({ expense, open, onOpenChange, defaultMonth }: VariableExpenseDialogProps) {
  const [formData, setFormData] = useState<CreateVariableExpenseData>({
    title: '',
    estimatedAmount: 0,
    category: '',
    description: '',
    month: defaultMonth || new Date().toISOString().slice(0, 7),
    tags: [],
  })

  const [newTag, setNewTag] = useState('')

  const { addVariableExpense, updateVariableExpense } = useVariableExpenseStore()
  const { categories } = useCategoryStore()

  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        estimatedAmount: expense.estimatedAmount,
        category: expense.category,
        description: expense.description || '',
        month: expense.month,
        tags: expense.tags || [],
      })
    } else {
      setFormData({
        title: '',
        estimatedAmount: 0,
        category: '',
        description: '',
        month: defaultMonth || new Date().toISOString().slice(0, 7),
        tags: [],
      })
    }
  }, [expense, open, defaultMonth])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.category || formData.estimatedAmount <= 0) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (expense) {
      updateVariableExpense(expense.id, formData)
    } else {
      addVariableExpense(formData)
    }

    onOpenChange(false)
  }

  const handleInputChange = (field: keyof CreateVariableExpenseData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      const updatedTags = [...(formData.tags || []), newTag.trim()]
      handleInputChange('tags', updatedTags)
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags?.filter(tag => tag !== tagToRemove) || []
    handleInputChange('tags', updatedTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Gerar opções de meses (3 meses para trás e 12 para frente)
  const generateMonthOptions = () => {
    const options = []
    const today = new Date()
    
    for (let i = -3; i <= 12; i++) {
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

  const monthOptions = generateMonthOptions()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {expense ? 'Editar Despesa Variada' : 'Nova Despesa Variada'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Supermercado, Combustível, Lazer..."
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedAmount">Valor Estimado *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimatedAmount"
                  type="number"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  className="pl-10"
                  value={formData.estimatedAmount}
                  onChange={(e) => handleInputChange('estimatedAmount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="month">Mês *</Label>
              <Select
                value={formData.month}
                onValueChange={(value) => handleInputChange('month', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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

            <div className="col-span-2">
              <Label htmlFor="tags">Tags (Opcional)</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Digite uma tag e pressione Enter"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleTagKeyPress}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
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