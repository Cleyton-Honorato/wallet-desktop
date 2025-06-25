import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CategoryIcon } from './CategoryIcon'
import { TransactionDialog } from './TransactionDialog'
import { Transaction, useTransactionStore } from '../stores/transactionStore'
import { useCategoryStore } from '../stores/categoryStore'
import { Edit2, Trash2, Calendar, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { removeTransaction } = useTransactionStore()
  const { getCategoryById } = useCategoryStore()

  const category = getCategoryById(transaction.category)
  const isIncome = transaction.type === 'income'

  const handleDelete = () => {
    removeTransaction(transaction.id)
    setShowDeleteConfirm(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          {/* Informações principais */}
          <div className="flex items-start gap-3 flex-1">
            {/* Ícone da categoria */}
            {category && (
              <div className="mt-1">
                <CategoryIcon 
                  icon={category.icon} 
                  color={category.color} 
                  size="sm" 
                />
              </div>
            )}
            
            {/* Detalhes da transação */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm truncate">{transaction.title}</h3>
                <Badge 
                  variant={isIncome ? 'default' : 'destructive'}
                  className={`text-xs ${
                    isIncome 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}
                >
                  {isIncome ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
              
              {/* Categoria */}
              {category && (
                <p className="text-xs text-muted-foreground mb-1">
                  {category.name}
                </p>
              )}
              
              {/* Data */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(transaction.date)}</span>
              </div>
              
              {/* Descrição */}
              {transaction.description && (
                <div className="flex items-start gap-1 text-xs text-muted-foreground">
                  <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <p className="line-clamp-2">{transaction.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Valor e ações */}
          <div className="flex flex-col items-end gap-2">
            {/* Valor */}
            <div className={`font-semibold text-sm ${
              isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
            
            {/* Ações */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <TransactionDialog
                transaction={transaction}
                trigger={
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                }
              />
              
              {showDeleteConfirm ? (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={handleDelete}
                  >
                    Confirmar
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 