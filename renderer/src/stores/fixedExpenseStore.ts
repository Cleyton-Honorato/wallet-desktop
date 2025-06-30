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
  getMonthlyExpenseStats: (month?: string) => {
    totalExpenses: FixedExpense[]
    paidExpenses: FixedExpense[]
    pendingExpenses: FixedExpense[]
    overdueExpenses: FixedExpense[]
    upcomingExpenses: FixedExpense[]
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    overdueAmount: number
    upcomingAmount: number
  }
  getRemainingInstallments: (expense: FixedExpense, currentMonth?: string) => number | null
  getExpenseStatus: (expense: FixedExpense, currentMonth?: string) => 'paid' | 'overdue' | 'upcoming' | 'inactive'
  createTransactionForExpense: (expenseId: string, month?: string) => boolean
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

      getMonthlyExpenseStats: (month) => {
        const now = new Date()
        const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const [year, monthNum] = currentMonth.split('-').map(Number)
        const today = new Date()
        
        // Obtém despesas ativas que devem estar ativas no mês especificado
        const allActiveExpenses = get().getActiveExpenses()
        const totalExpenses = allActiveExpenses.filter(expense => {
          const startDate = new Date(expense.startDate)
          const startYear = startDate.getFullYear()
          const startMonth = startDate.getMonth() + 1
          
          // Verifica se a despesa já começou
          if (startYear > year || (startYear === year && startMonth > monthNum)) {
            return false
          }
          
          // Verifica se a despesa ainda não terminou
          if (expense.endDate) {
            const endDate = new Date(expense.endDate)
            const endYear = endDate.getFullYear()
            const endMonth = endDate.getMonth() + 1
            
            if (endYear < year || (endYear === year && endMonth < monthNum)) {
              return false
            }
          }
          
          return true
        })
        
        // Despesas que já foram processadas (têm transação gerada)
        const paidExpenses = totalExpenses.filter(expense => 
          get().isExpenseProcessedInMonth(expense.id, currentMonth)
        )
        
        // Despesas que ainda não foram processadas
        const pendingExpenses = totalExpenses.filter(expense => 
          !get().isExpenseProcessedInMonth(expense.id, currentMonth)
        )
        
        // Despesas vencidas (dia de vencimento já passou no mês atual)
        const overdueExpenses = pendingExpenses.filter(expense => {
          if (currentMonth !== `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`) {
            return false // Só considera vencidas no mês atual
          }
          
          const dueDate = new Date(year, monthNum - 1, expense.dueDay)
          
          // Ajusta se o dia não existe no mês
          if (dueDate.getMonth() !== monthNum - 1) {
            dueDate.setDate(0) // Vai para o último dia do mês anterior
          }
          
          return dueDate < today
        })
        
        // Despesas que ainda vão vencer (no mês atual)
        const upcomingExpenses = pendingExpenses.filter(expense => {
          if (currentMonth !== `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`) {
            return true // Se não é o mês atual, todas pendentes são "futuras"
          }
          
          const dueDate = new Date(year, monthNum - 1, expense.dueDay)
          
          // Ajusta se o dia não existe no mês
          if (dueDate.getMonth() !== monthNum - 1) {
            dueDate.setDate(0)
          }
          
          return dueDate >= today
        })

        const totalAmount = totalExpenses.reduce((total, expense) => total + expense.amount, 0)
        const paidAmount = paidExpenses.reduce((total, expense) => total + expense.amount, 0)
        const pendingAmount = pendingExpenses.reduce((total, expense) => total + expense.amount, 0)
        const overdueAmount = overdueExpenses.reduce((total, expense) => total + expense.amount, 0)
        const upcomingAmount = upcomingExpenses.reduce((total, expense) => total + expense.amount, 0)

        return {
          totalExpenses,
          paidExpenses,
          pendingExpenses,
          overdueExpenses,
          upcomingExpenses,
          totalAmount,
          paidAmount,
          pendingAmount,
          overdueAmount,
          upcomingAmount
        }
      },

      getRemainingInstallments: (expense, currentMonth) => {
        if (!expense.endDate) {
          return null // Despesa sem fim definido
        }
        
        const now = new Date()
        const current = currentMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const [currentYear, currentMonthNum] = current.split('-').map(Number)
        
        const endDate = new Date(expense.endDate)
        const endYear = endDate.getFullYear()
        const endMonth = endDate.getMonth() + 1
        
        // Calcula a diferença em meses
        const remainingMonths = (endYear - currentYear) * 12 + (endMonth - currentMonthNum)
        
        return Math.max(0, remainingMonths + 1) // +1 para incluir o mês atual
      },

      getExpenseStatus: (expense, currentMonth) => {
        const now = new Date()
        const current = currentMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const [currentYear, currentMonthNum] = current.split('-').map(Number)
        
        // Verifica se a despesa está ativa
        if (!expense.isActive) {
          return 'inactive'
        }
        
        // Verifica se a despesa já começou
        const startDate = new Date(expense.startDate)
        const startYear = startDate.getFullYear()
        const startMonth = startDate.getMonth() + 1
        
        if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonthNum)) {
          return 'inactive' // Ainda não começou
        }
        
        // Verifica se a despesa já terminou
        if (expense.endDate) {
          const endDate = new Date(expense.endDate)
          const endYear = endDate.getFullYear()
          const endMonth = endDate.getMonth() + 1
          
          if (endYear < currentYear || (endYear === currentYear && endMonth < currentMonthNum)) {
            return 'inactive' // Já terminou
          }
        }
        
        // Verifica se já foi paga no mês
        if (get().isExpenseProcessedInMonth(expense.id, current)) {
          return 'paid'
        }
        
        // Se não foi paga, verifica se está vencida ou ainda vai vencer
        if (current === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`) {
          const today = now
          const dueDate = new Date(currentYear, currentMonthNum - 1, expense.dueDay)
          
          // Ajusta se o dia não existe no mês
          if (dueDate.getMonth() !== currentMonthNum - 1) {
            dueDate.setDate(0)
          }
          
          return dueDate < today ? 'overdue' : 'upcoming'
        }
        
        // Para meses diferentes do atual, considera como upcoming
        return 'upcoming'
      },

      createTransactionForExpense: (expenseId, month) => {
        const now = new Date()
        const currentMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        
        // Encontra a despesa
        const expense = get().fixedExpenses.find(e => e.id === expenseId)
        if (!expense || !expense.isActive) {
          return false
        }
        
        // Verifica se já foi processada
        if (get().isExpenseProcessedInMonth(expenseId, currentMonth)) {
          return false
        }
        
        const [year, monthNum] = currentMonth.split('-').map(Number)
        
        // Verifica se a despesa está no período ativo
        const startDate = new Date(expense.startDate)
        const startYear = startDate.getFullYear()
        const startMonth = startDate.getMonth() + 1
        
        if (startYear > year || (startYear === year && startMonth > monthNum)) {
          return false // Ainda não começou
        }
        
        if (expense.endDate) {
          const endDate = new Date(expense.endDate)
          const endYear = endDate.getFullYear()
          const endMonth = endDate.getMonth() + 1
          
          if (endYear < year || (endYear === year && endMonth < monthNum)) {
            return false // Já terminou
          }
        }

        // Cria a data de vencimento
        const dueDate = new Date(year, monthNum - 1, expense.dueDay)
        
        // Ajusta se o dia não existe no mês
        if (dueDate.getMonth() !== monthNum - 1) {
          dueDate.setDate(0)
        }

        // Cria a transação
        const transactionStore = useTransactionStore.getState()
        const transactionId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
        
        const transactionData = {
          id: transactionId,
          title: `${expense.title} (Despesa Fixa)`,
          amount: expense.amount,
          type: 'expense' as const,
          category: expense.category,
          date: dueDate.toISOString(),
          description: `${expense.description || ''} - Pago individualmente`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        // Adiciona a transação
        transactionStore.transactions.push(transactionData)
        
        // Registra o controle
        const generatedTransaction = {
          expenseId: expenseId,
          month: currentMonth,
          transactionId: transactionId,
          generatedAt: new Date().toISOString()
        }
        
        set((state) => ({
          generatedTransactions: [...state.generatedTransactions, generatedTransaction]
        }))
        
        return true
      },
    }),
    {
      name: 'wallet-fixed-expenses',
    }
  )
) 