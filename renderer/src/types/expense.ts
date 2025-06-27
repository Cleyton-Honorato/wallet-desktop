export interface FixedExpense {
  id: string
  title: string
  amount: number
  category: string
  description?: string
  dueDay: number // Dia do mês em que vence (1-31)
  isActive: boolean
  startDate: string
  endDate?: string // Data opcional de término
  createdAt: string
  updatedAt: string
}

export interface VariableExpense {
  id: string
  title: string
  estimatedAmount: number
  actualAmount?: number
  category: string
  description?: string
  month: string // Formato: YYYY-MM
  tags?: string[]
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFixedExpenseData {
  title: string
  amount: number
  category: string
  description?: string
  dueDay: number
  startDate: string
  endDate?: string
}

export interface CreateVariableExpenseData {
  title: string
  estimatedAmount: number
  category: string
  description?: string
  month: string
  tags?: string[]
}

export interface UpdateFixedExpenseData extends Partial<CreateFixedExpenseData> {
  isActive?: boolean
}

export interface UpdateVariableExpenseData extends Partial<CreateVariableExpenseData> {
  actualAmount?: number
  isCompleted?: boolean
}

// Nova interface para controlar transações geradas
export interface GeneratedTransaction {
  expenseId: string
  month: string // Formato: YYYY-MM
  transactionId: string
  generatedAt: string
}

export interface ExpenseTransactionControl {
  fixedExpenseTransactions: GeneratedTransaction[]
} 