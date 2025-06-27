import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  FixedExpense, 
  CreateFixedExpenseData, 
  UpdateFixedExpenseData,
  GeneratedTransaction
} from '../types/expense'
import { useTransactionStore } from './transactionStore'

interface FixedExpenseStore {
  fixedExpenses: FixedExpense[]
  generatedTransactions: GeneratedTransaction[]
  addFixedExpense: (expense: CreateFixedExpenseData) => void
  updateFixedExpense: (id: string, expense: UpdateFixedExpenseData) => void
  removeFixedExpense: (id: string) => void
  toggleExpenseStatus: (id: string) => void
  getActiveExpenses: () => FixedExpense[]
  getExpensesByCategory: (category: string) => FixedExpense[]
  getTotalMonthlyAmount: () => number
  generateMonthlyTransactions: (month: string) => number
  getExpensesDueThisMonth: () => FixedExpense[]
  isExpenseProcessedInMonth: (expenseId: string, month: string) => boolean
  getProcessedExpensesInMonth: (month: string) => GeneratedTransaction[]
  removeGeneratedTransaction: (expenseId: string, month: string) => void
  deleteTransactionAndControl: (expenseId: string, month: string) => boolean
  getMonthsWithGeneratedTransactions: () => string[]
  clearGeneratedTransactionsForMonth: (month: string) => number
}

export const useFixedExpenseStore = create<FixedExpenseStore>()(
  persist(
    (set, get) => ({
      fixedExpenses: [],
      generatedTransactions: [],

      addFixedExpense: (expenseData) => {
        const now = new Date().toISOString()
        const newExpense: FixedExpense = {
          ...expenseData,
          id: Date.now().toString(),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          fixedExpenses: [...state.fixedExpenses, newExpense],
        }))
      },

      updateFixedExpense: (id, expenseData) => {
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...expenseData, updatedAt: new Date().toISOString() }
              : expense
          ),
        }))
      },

      removeFixedExpense: (id) => {
        set((state) => ({
          fixedExpenses: state.fixedExpenses.filter((expense) => expense.id !== id),
        }))
      },

      toggleExpenseStatus: (id) => {
        set((state) => ({
          fixedExpenses: state.fixedExpenses.map((expense) =>
            expense.id === id
              ? { 
                  ...expense, 
                  isActive: !expense.isActive,
                  updatedAt: new Date().toISOString()
                }
              : expense
          ),
        }))
      },

      getActiveExpenses: () => {
        return get().fixedExpenses.filter((expense) => expense.isActive)
      },

      getExpensesByCategory: (category) => {
        return get().fixedExpenses.filter((expense) => expense.category === category)
      },

      getTotalMonthlyAmount: () => {
        return get().getActiveExpenses().reduce((total, expense) => total + expense.amount, 0)
      },

      generateMonthlyTransactions: (month) => {
        const activeExpenses = get().getActiveExpenses()
        const [year, monthNum] = month.split('-').map(Number)
        let createdTransactions = 0
        
        activeExpenses.forEach((expense) => {
          // Verifica se esta despesa já foi processada neste mês
          if (get().isExpenseProcessedInMonth(expense.id, month)) {
            return
          }
          
          // Verifica se a despesa está dentro do período ativo
          const startDate = new Date(expense.startDate)
          
          // Compara apenas ano e mês, não o dia específico
          const startYear = startDate.getFullYear()
          const startMonth = startDate.getMonth() + 1 // getMonth() retorna 0-11
          const targetYear = year
          const targetMonth = monthNum
          
          // Verifica se a despesa ainda não começou (ano/mês de início é posterior ao mês target)
          if (startYear > targetYear || (startYear === targetYear && startMonth > targetMonth)) {
            return
          }
          
          if (expense.endDate) {
            const endDate = new Date(expense.endDate)
            const endYear = endDate.getFullYear()
            const endMonth = endDate.getMonth() + 1
            
            // Verifica se a despesa já terminou (ano/mês de fim é anterior ao mês target)
            if (endYear < targetYear || (endYear === targetYear && endMonth < targetMonth)) {
              return
            }
          }

          // Cria a data de vencimento para o mês
          const dueDate = new Date(year, monthNum - 1, expense.dueDay)
          
          // Ajusta se o dia não existe no mês (ex: 31 de fevereiro)
          if (dueDate.getMonth() !== monthNum - 1) {
            dueDate.setDate(0) // Vai para o último dia do mês anterior
          }

          // Adiciona a transação usando o store de transações
          const transactionStore = useTransactionStore.getState()
          
          // Cria a transação
          const transactionData = {
            title: `${expense.title} (Despesa Fixa)`,
            amount: expense.amount,
            type: 'expense' as const,
            category: expense.category,
            date: dueDate.toISOString(),
            description: `${expense.description || ''} - Gerada automaticamente da despesa fixa`,
          }
          
          // Gera um ID único para a transação antes de criá-la
          const transactionId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
          
          // Adiciona a transação com ID específico
          const newTransactionData = {
            ...transactionData,
            id: transactionId
          }
          
          // Adiciona diretamente ao store de transações
          transactionStore.transactions.push(newTransactionData)
          
          // Registra o controle da transação gerada
          const generatedTransaction: GeneratedTransaction = {
            expenseId: expense.id,
            month: month,
            transactionId: transactionId,
            generatedAt: new Date().toISOString()
          }
          
          set((state) => ({
            generatedTransactions: [...state.generatedTransactions, generatedTransaction]
          }))
          
          createdTransactions++
        })
        return createdTransactions
      },

      getExpensesDueThisMonth: () => {
        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        
        return get().getActiveExpenses().filter((expense) => {
          const startDate = new Date(expense.startDate)
          const expenseMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
          
          if (expenseMonth > currentMonth) return false
          
          if (expense.endDate) {
            const endDate = new Date(expense.endDate)
            const endMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
            if (endMonth < currentMonth) return false
          }
          
          return true
        })
      },

      isExpenseProcessedInMonth: (expenseId, month) => {
        return get().generatedTransactions.some(t => t.expenseId === expenseId && t.month === month)
      },

      getProcessedExpensesInMonth: (month) => {
        return get().generatedTransactions.filter(t => t.month === month)
      },

      removeGeneratedTransaction: (expenseId, month) => {
        set((state) => ({
          generatedTransactions: state.generatedTransactions.filter(t => t.expenseId !== expenseId && t.month !== month),
        }))
      },

      deleteTransactionAndControl: (expenseId, month) => {
        const generatedTransaction = get().generatedTransactions.find(
          t => t.expenseId === expenseId && t.month === month
        )
        
        if (!generatedTransaction) {
          console.log(`Nenhuma transação gerada encontrada para despesa ${expenseId} no mês ${month}`)
          return false
        }
        
        // Remove a transação do store de transações
        const transactionStore = useTransactionStore.getState()
        transactionStore.removeTransaction(generatedTransaction.transactionId)
        
        // Remove o controle da transação gerada
        set((state) => ({
          generatedTransactions: state.generatedTransactions.filter(
            t => !(t.expenseId === expenseId && t.month === month)
          )
        }))

        return true
      },

      getMonthsWithGeneratedTransactions: () => {
        const months = get().generatedTransactions.map(t => t.month)
        return [...new Set(months)].sort()
      },

      clearGeneratedTransactionsForMonth: (month) => {
        const transactionsToRemove = get().generatedTransactions.filter(t => t.month === month)
        const transactionStore = useTransactionStore.getState()
        
        // Remove todas as transações do mês
        transactionsToRemove.forEach(genTransaction => {
          transactionStore.removeTransaction(genTransaction.transactionId)
        })
        
        // Remove todos os controles do mês
        set((state) => ({
          generatedTransactions: state.generatedTransactions.filter(t => t.month !== month)
        }))
        
        return transactionsToRemove.length
      },
    }),
    {
      name: 'wallet-fixed-expenses',
    }
  )
) 