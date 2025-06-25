import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { CategoryIcon } from './CategoryIcon'
import { useCategoryStore } from '../stores/categoryStore'
import { Search, Filter, X, Calendar } from 'lucide-react'

export interface TransactionFilters {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  dateFrom: string
  dateTo: string
}

interface TransactionFiltersProps {
  filters: TransactionFilters
  onFiltersChange: (filters: TransactionFilters) => void
}

export function TransactionFilters({ filters, onFiltersChange }: TransactionFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { categories } = useCategoryStore()

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      category: '',
      dateFrom: '',
      dateTo: ''
    })
    setShowAdvanced(false)
  }

  const hasActiveFilters = 
    filters.search || 
    filters.type !== 'all' || 
    filters.category || 
    filters.dateFrom || 
    filters.dateTo

  const getFilteredCategories = () => {
    if (filters.type === 'all') return categories
    return categories.filter(cat => cat.type === filters.type)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.type !== 'all') count++
    if (filters.category) count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e botão de filtros */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar transações..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="relative"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          {/* Tipo de transação */}
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <div className="flex gap-2">
              <Button
                variant={filters.type === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('type', 'all')}
              >
                Todas
              </Button>
              <Button
                variant={filters.type === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('type', 'income')}
                className={filters.type === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Receitas
              </Button>
              <Button
                variant={filters.type === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('type', 'expense')}
                className={filters.type === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Despesas
              </Button>
            </div>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              <button
                type="button"
                onClick={() => updateFilter('category', '')}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                  !filters.category
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs">*</span>
                </div>
                <span className="text-sm font-medium">Todas</span>
              </button>
              
              {getFilteredCategories().map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => updateFilter('category', category.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                    filters.category === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <CategoryIcon 
                    icon={category.icon} 
                    color={category.color} 
                    size="sm" 
                  />
                  <span className="text-sm font-medium truncate">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Período
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                  Data inicial
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  max={filters.dateTo || undefined}
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                  Data final
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  min={filters.dateFrom || undefined}
                />
              </div>
            </div>
          </div>

          {/* Atalhos de período */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Atalhos de período</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  updateFilter('dateFrom', today)
                  updateFilter('dateTo', today)
                }}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
                  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
                  updateFilter('dateFrom', startOfWeek.toISOString().split('T')[0])
                  updateFilter('dateTo', endOfWeek.toISOString().split('T')[0])
                }}
              >
                Esta semana
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                  updateFilter('dateFrom', startOfMonth.toISOString().split('T')[0])
                  updateFilter('dateTo', endOfMonth.toISOString().split('T')[0])
                }}
              >
                Este mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const startOfYear = new Date(today.getFullYear(), 0, 1)
                  const endOfYear = new Date(today.getFullYear(), 11, 31)
                  updateFilter('dateFrom', startOfYear.toISOString().split('T')[0])
                  updateFilter('dateTo', endOfYear.toISOString().split('T')[0])
                }}
              >
                Este ano
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 