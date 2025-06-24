import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Category, CreateCategoryData, CategoryType } from '../types/category'

interface CategoryStore {
  categories: Category[]
  addCategory: (categoryData: CreateCategoryData) => void
  updateCategory: (id: string, categoryData: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getCategoriesByType: (type: CategoryType) => Category[]
  getCategoryById: (id: string) => Category | undefined
  initializeDefaultCategories: () => void
}

const defaultCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Categorias de Receita
  {
    name: 'Salário',
    type: 'income',
    color: '#10B981',
    icon: 'Briefcase',
    description: 'Salário mensal'
  },
  {
    name: 'Freelance',
    type: 'income',
    color: '#3B82F6',
    icon: 'Laptop',
    description: 'Trabalhos freelance'
  },
  {
    name: 'Investimentos',
    type: 'income',
    color: '#8B5CF6',
    icon: 'TrendingUp',
    description: 'Retorno de investimentos'
  },
  {
    name: 'Vendas',
    type: 'income',
    color: '#F59E0B',
    icon: 'ShoppingBag',
    description: 'Vendas de produtos'
  },
  
  // Categorias de Despesa
  {
    name: 'Alimentação',
    type: 'expense',
    color: '#EF4444',
    icon: 'UtensilsCrossed',
    description: 'Gastos com comida'
  },
  {
    name: 'Transporte',
    type: 'expense',
    color: '#F97316',
    icon: 'Car',
    description: 'Transporte e combustível'
  },
  {
    name: 'Moradia',
    type: 'expense',
    color: '#84CC16',
    icon: 'Home',
    description: 'Aluguel, contas da casa'
  },
  {
    name: 'Saúde',
    type: 'expense',
    color: '#06B6D4',
    icon: 'Heart',
    description: 'Gastos médicos e farmácia'
  },
  {
    name: 'Educação',
    type: 'expense',
    color: '#8B5CF6',
    icon: 'GraduationCap',
    description: 'Cursos, livros, educação'
  },
  {
    name: 'Entretenimento',
    type: 'expense',
    color: '#EC4899',
    icon: 'Gamepad2',
    description: 'Lazer e entretenimento'
  },
  {
    name: 'Compras',
    type: 'expense',
    color: '#F59E0B',
    icon: 'ShoppingCart',
    description: 'Compras diversas'
  },
  {
    name: 'Outros',
    type: 'expense',
    color: '#6B7280',
    icon: 'MoreHorizontal',
    description: 'Outros gastos'
  }
]

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],
      
      addCategory: (categoryData) => {
        const now = new Date().toISOString()
        const newCategory: Category = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          categories: [...state.categories, newCategory],
        }))
      },
      
      updateCategory: (id, categoryData) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? { ...category, ...categoryData, updatedAt: new Date().toISOString() }
              : category
          ),
        }))
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }))
      },
      
      getCategoriesByType: (type) => {
        const { categories } = get()
        return categories.filter((category) => category.type === type)
      },
      
      getCategoryById: (id) => {
        const { categories } = get()
        return categories.find((category) => category.id === id)
      },
      
      initializeDefaultCategories: () => {
        const { categories } = get()
        if (categories.length === 0) {
          const now = new Date().toISOString()
          const categoriesWithIds = defaultCategories.map((category, index) => ({
            ...category,
            id: (Date.now() + index).toString(),
            createdAt: now,
            updatedAt: now,
          }))
          set({ categories: categoriesWithIds })
        }
      },
    }),
    {
      name: 'wallet-categories',
    }
  )
) 