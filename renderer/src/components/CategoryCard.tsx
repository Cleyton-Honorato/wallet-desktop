import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import { Category } from '../types/category'
import { CategoryIcon } from './CategoryIcon'

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${category.color}20` }}
            >
              <CategoryIcon 
                name={category.icon} 
                color={category.color} 
                size={20}
              />
            </div>
            <div>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <Badge 
                variant={category.type === 'income' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {category.type === 'income' ? 'Receita' : 'Despesa'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {category.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        </CardContent>
      )}
      
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
        style={{ backgroundColor: category.color }}
      />
    </Card>
  )
} 