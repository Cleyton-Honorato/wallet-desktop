import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Plus, X } from 'lucide-react'
import { useVariableIncomeStore } from '../stores/variableIncomeStore'
import { useCategoryStore } from '../stores/categoryStore'
import type { VariableIncome } from '../types/income'

interface VariableIncomeDialogProps {
  income?: VariableIncome | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultMonth?: string
}

export function VariableIncomeDialog({ income, open, onOpenChange, defaultMonth }: VariableIncomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [estimatedAmount, setEstimatedAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [month, setMonth] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const { addVariableIncome, updateVariableIncome } = useVariableIncomeStore()
  const { categories } = useCategoryStore()

  const incomeCategories = categories.filter(c => c.type === 'income')

  const isEditing = !!income

  useEffect(() => {
    if (income) {
      setTitle(income.title)
      setEstimatedAmount(income.estimatedAmount.toString())
      setCategory(income.category)
      setDescription(income.description || '')
      setMonth(income.month)
      setTags(income.tags || [])
    } else {
      resetForm()
      if (defaultMonth) {
        setMonth(defaultMonth)
      }
    }
  }, [income, defaultMonth])

  const resetForm = () => {
    setTitle('')
    setEstimatedAmount('')
    setCategory('')
    setDescription('')
    setMonth(defaultMonth || '')
    setTags([])
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !estimatedAmount || !category || !month) {
      return
    }

    const incomeData = {
      title,
      estimatedAmount: parseFloat(estimatedAmount),
      category,
      description: description || undefined,
      month,
      tags: tags.length > 0 ? tags : undefined,
    }

    if (isEditing && income) {
      updateVariableIncome(income.id, incomeData)
    } else {
      addVariableIncome(incomeData)
    }

    resetForm()
    if (onOpenChange) {
      onOpenChange(false)
    } else {
      setIsOpen(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setIsOpen(newOpen)
    }
    
    if (!newOpen) {
      resetForm()
    }
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

  const monthOptions = generateMonthOptions()
  const dialogOpen = open !== undefined ? open : isOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita Variável
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Receita Variável' : 'Nova Receita Variável'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados da receita eventual' 
              : 'Adicione uma receita não recorrente para um mês específico'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Venda de produto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedAmount">Valor Estimado</Label>
            <Input
              id="estimatedAmount"
              type="number"
              step="0.01"
              value={estimatedAmount}
              onChange={(e) => setEstimatedAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Mês</Label>
            <Select value={month} onValueChange={setMonth} required>
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição adicional..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags (Opcional)</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Salvar Alterações' : 'Adicionar Receita'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 