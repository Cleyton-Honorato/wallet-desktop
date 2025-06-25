import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { useCategoryStore } from '../stores/categoryStore'
import { CategoryType, CreateCategoryData } from '../types/category'
import { CategoryIcon } from './CategoryIcon'

interface CategoryDialogProps {
  isOpen: boolean
  onClose: () => void
  editingCategoryId?: string | null
  defaultType?: CategoryType
}

const AVAILABLE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#374151'
]

const AVAILABLE_ICONS = {
  income: [
    'Briefcase', 'Laptop', 'TrendingUp', 'ShoppingBag', 'DollarSign',
    'PiggyBank', 'Gift', 'Award', 'Star', 'Circle'
  ],
  expense: [
    'CreditCard', 'Wallet', 'Receipt', 'UtensilsCrossed', 'Car', 
    'Home', 'Heart', 'GraduationCap', 'Gamepad2', 'ShoppingCart', 
    'Plane', 'Shirt', 'Fuel', 'Phone', 'Zap', 
    'Wifi', 'Building', 'Users', 'PawPrint', 'Wrench'
  ]
}

export function CategoryDialog({ 
  isOpen, 
  onClose, 
  editingCategoryId, 
  defaultType = 'expense' 
}: CategoryDialogProps) {
  const { addCategory, updateCategory, getCategoryById } = useCategoryStore()
  
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    type: defaultType,
    color: AVAILABLE_COLORS[0],
    icon: AVAILABLE_ICONS[defaultType][0],
    description: ''
  })

  const editingCategory = editingCategoryId ? getCategoryById(editingCategoryId) : null

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        type: editingCategory.type,
        color: editingCategory.color,
        icon: editingCategory.icon,
        description: editingCategory.description || ''
      })
    } else {
      setFormData({
        name: '',
        type: defaultType,
        color: AVAILABLE_COLORS[0],
        icon: AVAILABLE_ICONS[defaultType][0],
        description: ''
      })
    }
  }, [editingCategory, defaultType, isOpen])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    if (editingCategoryId) {
      updateCategory(editingCategoryId, formData)
    } else {
      addCategory(formData)
    }
    
    onClose()
  }

  const handleTypeChange = (type: CategoryType) => {
    setFormData(prev => ({
      ...prev,
      type,
      icon: AVAILABLE_ICONS[type][0] // Reset to first icon of the new type
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {editingCategory 
              ? 'Edite as informações da categoria' 
              : 'Crie uma nova categoria para organizar suas transações'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Alimentação, Salário..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Tipo</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={handleTypeChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600">Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600">Despesa</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Ícone</Label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS[formData.type].map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: iconName }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.icon === iconName
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CategoryIcon
                    icon={iconName}
                    color={formData.color}
                    size="md"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Cor</Label>
            <div className="grid grid-cols-10 gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === color
                      ? 'border-white shadow-lg scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da categoria..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 