import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useCategoryStore } from '../stores/categoryStore'
import { CategoryType } from '../types/category'
import { CategoryCard } from '../components/CategoryCard'
import { CategoryDialog } from '../components/CategoryDialog'

export function Categories() {
  const { 
    categories, 
    getCategoriesByType, 
    deleteCategory, 
    initializeDefaultCategories 
  } = useCategoryStore()
  
  const [activeTab, setActiveTab] = useState<CategoryType>('expense')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  useEffect(() => {
    initializeDefaultCategories()
  }, [initializeDefaultCategories])

  const incomeCategories = getCategoriesByType('income')
  const expenseCategories = getCategoriesByType('expense')

  const handleEditCategory = (categoryId: string) => {
    setEditingCategory(categoryId)
    setIsDialogOpen(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategory(categoryId)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              categorias de receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCategories.length}</div>
            <p className="text-xs text-muted-foreground">
              categorias de despesa
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CategoryType)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Receitas ({incomeCategories.length})
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Despesas ({expenseCategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEditCategory(category.id)}
                onDelete={() => handleDeleteCategory(category.id)}
              />
            ))}
          </div>
          {incomeCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria de receita encontrada
            </div>
          )}
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleEditCategory(category.id)}
                onDelete={() => handleDeleteCategory(category.id)}
              />
            ))}
          </div>
          {expenseCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria de despesa encontrada
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        editingCategoryId={editingCategory}
        defaultType={activeTab}
      />
    </div>
  )
} 