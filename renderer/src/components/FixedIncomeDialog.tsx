import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus } from 'lucide-react'
import { useFixedIncomeStore } from '../stores/fixedIncomeStore'
import { useCategoryStore } from '../stores/categoryStore'
import type { FixedIncome } from '../types/income'

interface FixedIncomeDialogProps {
  income?: FixedIncome | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function FixedIncomeDialog({ income, open, onOpenChange }: FixedIncomeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [receiptDay, setReceiptDay] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { addFixedIncome, updateFixedIncome } = useFixedIncomeStore()
  const { categories } = useCategoryStore()

  const incomeCategories = categories.filter(c => c.type === 'income')

  const isEditing = !!income

  useEffect(() => {
    if (income) {
      setTitle(income.title)
      setAmount(income.amount.toString())
      setCategory(income.category)
      setDescription(income.description || '')
      setReceiptDay(income.receiptDay.toString())
      setStartDate(income.startDate.split('T')[0])
      setEndDate(income.endDate ? income.endDate.split('T')[0] : '')
    } else {
      resetForm()
    }
  }, [income])

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('')
    setDescription('')
    setReceiptDay('')
    setStartDate('')
    setEndDate('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !amount || !category || !receiptDay || !startDate) {
      return
    }

    const incomeData = {
      title,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      receiptDay: parseInt(receiptDay),
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    }

    if (isEditing && income) {
      updateFixedIncome(income.id, incomeData)
    } else {
      addFixedIncome(incomeData)
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

  const dialogOpen = open !== undefined ? open : isOpen

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita Fixa
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Receita Fixa' : 'Nova Receita Fixa'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados da receita recorrente' 
              : 'Adicione uma nova receita que se repete mensalmente'
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
              placeholder="Ex: Salário"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
            <Label htmlFor="receiptDay">Dia do Recebimento</Label>
            <Select value={receiptDay} onValueChange={setReceiptDay} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Dia {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim (Opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
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