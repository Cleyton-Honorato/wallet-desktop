import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { useTransactionStore, Transaction, InstallmentInfo, RecurrenceInfo } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { CategoryIcon } from './CategoryIcon'
import { Plus, Edit2, DollarSign, Calendar, Repeat, CreditCard } from 'lucide-react'

interface TransactionDialogProps {
  transaction?: Transaction
  trigger?: React.ReactNode
  onClose?: () => void
}

export function TransactionDialog({ transaction, trigger, onClose }: TransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    // Opções de parcelamento
    hasInstallments: false,
    installments: {
      total: 1,
      amount: '',
      startDate: new Date().toISOString().split('T')[0]
    },
    // Opções de recorrência
    hasRecurrence: false,
    recurrence: {
      type: 'monthly' as 'weekly' | 'monthly' | 'yearly',
      endDate: '',
      lastOccurrence: new Date().toISOString().split('T')[0]
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addTransaction, updateTransaction } = useTransactionStore()
  const { categories, getCategoriesByType } = useCategoryStore()

  const isEditing = !!transaction
  const availableCategories = getCategoriesByType(formData.type)
  const selectedCategory = categories.find(cat => cat.id === formData.category)

  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date.split('T')[0],
        description: transaction.description || '',
        hasInstallments: !!transaction.installments,
        installments: transaction.installments 
          ? {
              total: transaction.installments.total,
              amount: transaction.installments.amount.toString(),
              startDate: transaction.installments.startDate.split('T')[0]
            }
          : {
              total: 1,
              amount: '',
              startDate: new Date().toISOString().split('T')[0]
            },
        hasRecurrence: !!transaction.recurrence,
        recurrence: transaction.recurrence
          ? {
              type: transaction.recurrence.type,
              endDate: transaction.recurrence.endDate || '',
              lastOccurrence: transaction.recurrence.lastOccurrence
            }
          : {
              type: 'monthly',
              endDate: '',
              lastOccurrence: new Date().toISOString().split('T')[0]
            }
      })
    }
  }, [transaction])

  useEffect(() => {
    // Reset category when type changes
    if (formData.category) {
      const categoryExists = availableCategories.some(cat => cat.id === formData.category)
      if (!categoryExists) {
        setFormData(prev => ({ ...prev, category: '' }))
      }
    }
  }, [formData.type, availableCategories])

  useEffect(() => {
    // Atualiza o valor das parcelas quando o valor total muda
    if (formData.hasInstallments && formData.amount) {
      const totalAmount = parseFloat(formData.amount)
      const installmentAmount = totalAmount / formData.installments.total
      setFormData(prev => ({
        ...prev,
        installments: {
          ...prev.installments,
          amount: installmentAmount.toFixed(2)
        }
      }))
    }
  }, [formData.amount, formData.installments.total, formData.hasInstallments])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero'
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória'
    }

    if (formData.hasInstallments) {
      if (formData.installments.total < 1) {
        newErrors.installments = 'Número de parcelas deve ser maior que zero'
      }
      if (!formData.installments.startDate) {
        newErrors.installmentStartDate = 'Data inicial é obrigatória'
      }
    }

    if (formData.hasRecurrence) {
      if (!formData.recurrence.type) {
        newErrors.recurrenceType = 'Tipo de recorrência é obrigatório'
      }
      if (!formData.recurrence.lastOccurrence) {
        newErrors.recurrenceStart = 'Data inicial é obrigatória'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const amount = parseFloat(formData.amount)
    let installmentInfo: InstallmentInfo | undefined
    let recurrenceInfo: RecurrenceInfo | undefined

    // Configura informações de parcelamento
    if (formData.hasInstallments) {
      installmentInfo = {
        total: formData.installments.total,
        current: 1,
        amount: parseFloat(formData.installments.amount),
        totalAmount: amount,
        startDate: new Date(formData.installments.startDate).toISOString()
      }
    }

    // Configura informações de recorrência
    if (formData.hasRecurrence) {
      recurrenceInfo = {
        type: formData.recurrence.type,
        endDate: formData.recurrence.endDate 
          ? new Date(formData.recurrence.endDate).toISOString()
          : undefined,
        lastOccurrence: new Date(formData.recurrence.lastOccurrence).toISOString()
      }
    }

    const transactionData = {
      title: formData.title.trim(),
      amount,
      type: formData.type,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
      description: formData.description.trim(),
      installments: installmentInfo,
      recurrence: recurrenceInfo
    }

    if (isEditing && transaction) {
      updateTransaction(transaction.id, transactionData)
    } else {
      addTransaction(transactionData)
    }

    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      hasInstallments: false,
      installments: {
        total: 1,
        amount: '',
        startDate: new Date().toISOString().split('T')[0]
      },
      hasRecurrence: false,
      recurrence: {
        type: 'monthly',
        endDate: '',
        lastOccurrence: new Date().toISOString().split('T')[0]
      }
    })
    setErrors({})
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit2 className="w-5 h-5" />
                Editar Transação
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Nova Transação
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div className="space-y-3">
            <Label>Tipo de Transação</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value: 'income' | 'expense') => 
                setFormData(prev => ({ ...prev, type: value, category: '' }))
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">
                  Receita
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">
                  Despesa
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Compra no supermercado"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
                className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            {availableCategories.length > 0 ? (
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <CategoryIcon 
                          icon={category.icon} 
                          color={category.color}
                          size="sm"
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground p-3 border border-dashed rounded-lg text-center">
                Nenhuma categoria de {formData.type === 'income' ? 'receita' : 'despesa'} encontrada.
                <br />
                Crie uma categoria primeiro.
              </p>
            )}
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Opções de Parcelamento */}
          {formData.type === 'expense' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <Label>Parcelamento</Label>
                </div>
                <Switch
                  checked={formData.hasInstallments}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, hasInstallments: checked }))
                  }
                />
              </div>

              {formData.hasInstallments && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="installments">Número de Parcelas</Label>
                    <Select
                      value={formData.installments.total.toString()}
                      onValueChange={(value) => 
                        setFormData(prev => ({
                          ...prev,
                          installments: {
                            ...prev.installments,
                            total: parseInt(value)
                          }
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o número de parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x de {formData.amount 
                              ? `R$ ${(parseFloat(formData.amount) / num).toFixed(2)}`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installmentStartDate">Data da Primeira Parcela</Label>
                    <Input
                      id="installmentStartDate"
                      type="date"
                      value={formData.installments.startDate}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          installments: {
                            ...prev.installments,
                            startDate: e.target.value
                          }
                        }))
                      }
                      className={errors.installmentStartDate ? 'border-red-500' : ''}
                    />
                    {errors.installmentStartDate && (
                      <p className="text-sm text-red-500">{errors.installmentStartDate}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opções de Recorrência */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                <Label>Recorrência</Label>
              </div>
              <Switch
                checked={formData.hasRecurrence}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, hasRecurrence: checked }))
                }
              />
            </div>

            {formData.hasRecurrence && (
              <div className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={formData.recurrence.type}
                    onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => 
                      setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          type: value
                        }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurrenceEndDate">Data de Término (opcional)</Label>
                  <Input
                    id="recurrenceEndDate"
                    type="date"
                    value={formData.recurrence.endDate}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        recurrence: {
                          ...prev.recurrence,
                          endDate: e.target.value
                        }
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição adicional (opcional)"
              rows={3}
            />
          </div>

          {/* Preview da categoria selecionada */}
          {selectedCategory && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CategoryIcon 
                  icon={selectedCategory.icon} 
                  color={selectedCategory.color}
                  size="md"
                />
                <div>
                  <p className="font-medium">{selectedCategory.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={availableCategories.length === 0}
            >
              {isEditing ? 'Salvar' : 'Criar'} Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 