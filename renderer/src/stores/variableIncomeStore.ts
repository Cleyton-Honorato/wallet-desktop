import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  VariableIncome, 
  CreateVariableIncomeData, 
  UpdateVariableIncomeData 
} from '../types/income'
import { useTransactionStore } from './transactionStore'

interface VariableIncomeStore {
  variableIncomes: VariableIncome[]
  addVariableIncome: (income: CreateVariableIncomeData) => void
  updateVariableIncome: (id: string, income: UpdateVariableIncomeData) => void
  removeVariableIncome: (id: string) => void
  markAsReceived: (id: string, actualAmount: number) => void
  undoReceived: (id: string) => void
  getIncomesByMonth: (month: string) => VariableIncome[]
  getIncomesByCategory: (category: string) => VariableIncome[]
  getMonthlyEstimatedTotal: (month: string) => number
  getMonthlyActualTotal: (month: string) => number
  getReceivedIncomes: (month: string) => VariableIncome[]
  getPendingIncomes: (month: string) => VariableIncome[]
  createTransactionFromIncome: (incomeId: string) => void
  duplicateIncomeToNextMonth: (id: string) => void
}

export const useVariableIncomeStore = create<VariableIncomeStore>()(
  persist(
    (set, get) => ({
      variableIncomes: [],

      addVariableIncome: (incomeData) => {
        const now = new Date().toISOString()
        const newIncome: VariableIncome = {
          ...incomeData,
          id: Date.now().toString(),
          isReceived: false,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          variableIncomes: [...state.variableIncomes, newIncome],
        }))
      },

      updateVariableIncome: (id, incomeData) => {
        set((state) => ({
          variableIncomes: state.variableIncomes.map((income) =>
            income.id === id
              ? { ...income, ...incomeData, updatedAt: new Date().toISOString() }
              : income
          ),
        }))
      },

      removeVariableIncome: (id) => {
        set((state) => ({
          variableIncomes: state.variableIncomes.filter((income) => income.id !== id),
        }))
      },

      markAsReceived: (id, actualAmount) => {
        set((state) => ({
          variableIncomes: state.variableIncomes.map((income) =>
            income.id === id
              ? { 
                  ...income, 
                  actualAmount,
                  isReceived: true,
                  updatedAt: new Date().toISOString()
                }
              : income
          ),
        }))

        // Cria automaticamente uma transação quando marcada como recebida
        get().createTransactionFromIncome(id)
      },

      undoReceived: (id) => {
        const income = get().variableIncomes.find((i) => i.id === id)
        if (!income || !income.isReceived) return

        // Remove a transação associada
        const transactionStore = useTransactionStore.getState()
        const incomeTitle = `${income.title} (Receita Variável)`
        
        // Busca e remove a transação correspondente
        const transactions = transactionStore.transactions
        const transactionToRemove = transactions.find(t => 
          t.title === incomeTitle && 
          t.amount === income.actualAmount &&
          t.type === 'income'
        )
        
        if (transactionToRemove) {
          transactionStore.removeTransaction(transactionToRemove.id)
        }

        // Marca a receita como não recebida
        set((state) => ({
          variableIncomes: state.variableIncomes.map((inc) =>
            inc.id === id
              ? { 
                  ...inc, 
                  isReceived: false,
                  actualAmount: undefined,
                  updatedAt: new Date().toISOString()
                }
              : inc
          ),
        }))
      },

      getIncomesByMonth: (month) => {
        return get().variableIncomes.filter((income) => income.month === month)
      },

      getIncomesByCategory: (category) => {
        return get().variableIncomes.filter((income) => income.category === category)
      },

      getMonthlyEstimatedTotal: (month) => {
        return get().getIncomesByMonth(month)
          .reduce((total, income) => total + income.estimatedAmount, 0)
      },

      getMonthlyActualTotal: (month) => {
        return get().getReceivedIncomes(month)
          .reduce((total, income) => total + (income.actualAmount || 0), 0)
      },

      getReceivedIncomes: (month) => {
        return get().getIncomesByMonth(month).filter((income) => income.isReceived)
      },

      getPendingIncomes: (month) => {
        return get().getIncomesByMonth(month).filter((income) => !income.isReceived)
      },

      createTransactionFromIncome: (incomeId) => {
        const income = get().variableIncomes.find((i) => i.id === incomeId)
        if (!income || !income.isReceived || !income.actualAmount) return

        // Adiciona a transação usando o store de transações
        const transactionStore = useTransactionStore.getState()
        const [year, month] = income.month.split('-').map(Number)
        const transactionDate = new Date(year, month - 1, new Date().getDate())

        transactionStore.addTransaction({
          title: `${income.title} (Receita Variável)`,
          amount: income.actualAmount,
          type: 'income',
          category: income.category,
          date: transactionDate.toISOString(),
          description: income.description,
        })
      },

      duplicateIncomeToNextMonth: (id) => {
        const income = get().variableIncomes.find((i) => i.id === id)
        if (!income) return

        const [year, month] = income.month.split('-').map(Number)
        const nextMonth = new Date(year, month, 1) // Próximo mês
        const nextMonthString = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`

        // Verifica se já existe uma receita igual no próximo mês
        const existingIncome = get().variableIncomes.find(
          (i) => i.month === nextMonthString && i.title === income.title && i.category === income.category
        )

        if (existingIncome) return // Não duplica se já existe

        const duplicatedIncome: CreateVariableIncomeData = {
          title: income.title,
          estimatedAmount: income.estimatedAmount,
          category: income.category,
          description: income.description,
          month: nextMonthString,
          tags: income.tags,
        }

        get().addVariableIncome(duplicatedIncome)
      },
    }),
    {
      name: 'wallet-variable-incomes',
    }
  )
) 