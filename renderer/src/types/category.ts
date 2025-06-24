export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
  description?: string
  createdAt: string
  updatedAt: string
}

export type CategoryType = 'income' | 'expense'

export interface CreateCategoryData {
  name: string
  type: CategoryType
  color: string
  icon: string
  description?: string
} 