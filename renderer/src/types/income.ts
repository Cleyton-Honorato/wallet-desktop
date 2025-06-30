export interface FixedIncome {
  id: string
  title: string
  amount: number
  category: string
  description?: string
  receiptDay: number // Dia do mês em que recebe (1-31)
  isActive: boolean
  startDate: string
  endDate?: string // Data opcional de término
  createdAt: string
  updatedAt: string
}

export interface VariableIncome {
  id: string
  title: string
  estimatedAmount: number
  actualAmount?: number
  category: string
  description?: string
  month: string // Formato: YYYY-MM
  tags?: string[]
  isReceived: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFixedIncomeData {
  title: string
  amount: number
  category: string
  description?: string
  receiptDay: number
  startDate: string
  endDate?: string
}

export interface CreateVariableIncomeData {
  title: string
  estimatedAmount: number
  category: string
  description?: string
  month: string
  tags?: string[]
}

export interface UpdateFixedIncomeData extends Partial<CreateFixedIncomeData> {
  isActive?: boolean
}

export interface UpdateVariableIncomeData extends Partial<CreateVariableIncomeData> {
  actualAmount?: number
  isReceived?: boolean
}

// Interface para controlar transações geradas de receitas
export interface GeneratedIncomeTransaction {
  incomeId: string
  month: string // Formato: YYYY-MM
  transactionId: string
  generatedAt: string
}

export interface IncomeTransactionControl {
  fixedIncomeTransactions: GeneratedIncomeTransaction[]
} 