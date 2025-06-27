import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  VariableExpense, 
  CreateVariableExpenseData, 
  UpdateVariableExpenseData 
} from '../types/expense'
import { useTransactionStore } from './transactionStore'

interface VariableExpenseStore {
  variableExpenses: VariableExpense[]
  addVariableExpense: (expense: CreateVariableExpenseData) => void
  updateVariableExpense: (id: string, expense: UpdateVariableExpenseData) => void
  removeVariableExpense: (id: string) => void
  markAsCompleted: (id: string, actualAmount: number) => void
  getExpensesByMonth: (month: string) => VariableExpense[]
  getExpensesByCategory: (category: string) => VariableExpense[]
  getMonthlyEstimatedTotal: (month: string) => number
  getMonthlyActualTotal: (month: string) => number
  getCompletedExpenses: (month: string) => VariableExpense[]
  getPendingExpenses: (month: string) => VariableExpense[]
  createTransactionFromExpense: (expenseId: string) => void
  duplicateExpenseToNextMonth: (id: string) => void
}

export const useVariableExpenseStore = create<VariableExpenseStore>()(
  persist(
    (set, get) => ({
      variableExpenses: [],

      addVariableExpense: (expenseData) => {
        const now = new Date().toISOString()
        const newExpense: VariableExpense = {
          ...expenseData,
          id: Date.now().toString(),
          isCompleted: false,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          variableExpenses: [...state.variableExpenses, newExpense],
        }))
      },

      updateVariableExpense: (id, expenseData) => {
        set((state) => ({
          variableExpenses: state.variableExpenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...expenseData, updatedAt: new Date().toISOString() }
              : expense
          ),
        }))
      },

      removeVariableExpense: (id) => {
        set((state) => ({
          variableExpenses: state.variableExpenses.filter((expense) => expense.id !== id),
        }))
      },

      markAsCompleted: (id, actualAmount) => {
        set((state) => ({
          variableExpenses: state.variableExpenses.map((expense) =>
            expense.id === id
              ? { 
                  ...expense, 
                  actualAmount,
                  isCompleted: true,
                  updatedAt: new Date().toISOString()
                }
              : expense
          ),
        }))

        // Cria automaticamente uma transação quando marcada como completa
        get().createTransactionFromExpense(id)
      },

      getExpensesByMonth: (month) => {
        return get().variableExpenses.filter((expense) => expense.month === month)
      },

      getExpensesByCategory: (category) => {
        return get().variableExpenses.filter((expense) => expense.category === category)
      },

      getMonthlyEstimatedTotal: (month) => {
        return get().getExpensesByMonth(month)
          .reduce((total, expense) => total + expense.estimatedAmount, 0)
      },

      getMonthlyActualTotal: (month) => {
        return get().getCompletedExpenses(month)
          .reduce((total, expense) => total + (expense.actualAmount || 0), 0)
      },

      getCompletedExpenses: (month) => {
        return get().getExpensesByMonth(month).filter((expense) => expense.isCompleted)
      },

      getPendingExpenses: (month) => {
        return get().getExpensesByMonth(month).filter((expense) => !expense.isCompleted)
      },

      createTransactionFromExpense: (expenseId) => {
        const expense = get().variableExpenses.find((e) => e.id === expenseId)
        if (!expense || !expense.isCompleted || !expense.actualAmount) return

        // Adiciona a transação usando o store de transações
        const transactionStore = useTransactionStore.getState()
        const [year, month] = expense.month.split('-').map(Number)
        const transactionDate = new Date(year, month - 1, new Date().getDate())

        transactionStore.addTransaction({
          title: `${expense.title} (Despesa Variada)`,
          amount: expense.actualAmount,
          type: 'expense',
          category: expense.category,
          date: transactionDate.toISOString(),
          description: expense.description,
        })
      },

      duplicateExpenseToNextMonth: (id) => {
        const expense = get().variableExpenses.find((e) => e.id === id)
        if (!expense) return

        const [year, month] = expense.month.split('-').map(Number)
        const nextMonth = new Date(year, month, 1) // Próximo mês
        const nextMonthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

        // Verifica se já existe uma despesa igual no próximo mês
        const existingExpense = get().variableExpenses.find(
          (e) => e.month === nextMonthString && e.title === expense.title && e.category === expense.category
        )

        if (existingExpense) return // Não duplica se já existe

        const duplicatedExpense: CreateVariableExpenseData = {
          title: expense.title,
          estimatedAmount: expense.estimatedAmount,
          category: expense.category,
          description: expense.description,
          month: nextMonthString,
          tags: expense.tags,
        }

        get().addVariableExpense(duplicatedExpense)
      },
    }),
    {
      name: 'wallet-variable-expenses',
    }
  )
) 