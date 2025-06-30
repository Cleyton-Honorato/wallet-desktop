import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  FixedIncome, 
  CreateFixedIncomeData, 
  UpdateFixedIncomeData,
  GeneratedIncomeTransaction,
  IncomeTransactionControl
} from '../types/income'
import { useTransactionStore } from './transactionStore'

interface FixedIncomeStore {
  fixedIncomes: FixedIncome[]
  transactionControl: IncomeTransactionControl
  addFixedIncome: (income: CreateFixedIncomeData) => void
  updateFixedIncome: (id: string, income: UpdateFixedIncomeData) => void
  removeFixedIncome: (id: string) => void
  getActiveIncomes: () => FixedIncome[]
  getIncomesByCategory: (category: string) => FixedIncome[]
  getMonthlyTotal: () => number
  createTransactionForIncome: (incomeId: string, month: string) => boolean
  undoTransactionForIncome: (incomeId: string, month: string) => boolean
  hasTransactionForMonth: (incomeId: string, month: string) => boolean
  generateMonthlyTransactions: () => void
}

export const useFixedIncomeStore = create<FixedIncomeStore>()(
  persist(
    (set, get) => ({
      fixedIncomes: [],
      transactionControl: {
        fixedIncomeTransactions: []
      },

      addFixedIncome: (incomeData) => {
        const now = new Date().toISOString()
        const newIncome: FixedIncome = {
          ...incomeData,
          id: Date.now().toString(),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          fixedIncomes: [...state.fixedIncomes, newIncome],
        }))
      },

      updateFixedIncome: (id, incomeData) => {
        set((state) => ({
          fixedIncomes: state.fixedIncomes.map((income) =>
            income.id === id
              ? { ...income, ...incomeData, updatedAt: new Date().toISOString() }
              : income
          ),
        }))
      },

      removeFixedIncome: (id) => {
        // Remove a receita
        set((state) => ({
          fixedIncomes: state.fixedIncomes.filter((income) => income.id !== id),
        }))

        // Remove todas as transações geradas para esta receita
        const transactionsToRemove = get().transactionControl.fixedIncomeTransactions
          .filter(t => t.incomeId === id)

        const transactionStore = useTransactionStore.getState()
        transactionsToRemove.forEach(t => {
          transactionStore.removeTransaction(t.transactionId)
        })

        // Remove do controle
        set((state) => ({
          transactionControl: {
            fixedIncomeTransactions: state.transactionControl.fixedIncomeTransactions
              .filter(t => t.incomeId !== id)
          }
        }))
      },

      getActiveIncomes: () => {
        return get().fixedIncomes.filter((income) => income.isActive)
      },

      getIncomesByCategory: (category) => {
        return get().fixedIncomes.filter((income) => income.category === category)
      },

      getMonthlyTotal: () => {
        return get().getActiveIncomes()
          .reduce((total, income) => total + income.amount, 0)
      },

      createTransactionForIncome: (incomeId, month) => {
        const income = get().fixedIncomes.find((i) => i.id === incomeId)
        if (!income || !income.isActive) {
          console.log('Receita não encontrada ou inativa')
          return false
        }

        // Verifica se já existe transação para este mês
        if (get().hasTransactionForMonth(incomeId, month)) {
          console.log('Transação já existe para este mês')
          return false
        }

        // Validações de data
        const [year, monthNum] = month.split('-').map(Number)
        const startDate = new Date(income.startDate)
        const targetDate = new Date(year, monthNum - 1, income.receiptDay)

        if (targetDate < startDate) {
          console.log('Data alvo anterior à data de início')
          return false
        }

        if (income.endDate) {
          const endDate = new Date(income.endDate)
          if (targetDate > endDate) {
            console.log('Data alvo posterior à data de fim')
            return false
          }
        }

        // Cria a transação
        const transactionStore = useTransactionStore.getState()
        const transactionDate = new Date(year, monthNum - 1, income.receiptDay)

        // Ajusta a data se o dia não existir no mês (ex: 31 de fevereiro)
        if (transactionDate.getMonth() !== monthNum - 1) {
          transactionDate.setDate(0) // Vai para o último dia do mês anterior
          transactionDate.setMonth(monthNum - 1) // Volta para o mês correto
        }

        try {
          // Cria a transação
          transactionStore.addTransaction({
            title: `${income.title} (Receita Fixa)`,
            amount: income.amount,
            type: 'income',
            category: income.category,
            date: transactionDate.toISOString(),
            description: income.description,
          })

          // Busca a transação recém-criada de forma mais robusta
          // Pega as transações atualizadas após a criação
          const updatedTransactions = useTransactionStore.getState().transactions
          
          // Busca pela transação mais recente que corresponde aos critérios
          const newTransaction = updatedTransactions
            .filter(t => 
              t.title === `${income.title} (Receita Fixa)` &&
              t.amount === income.amount &&
              t.type === 'income' &&
              t.category === income.category
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          if (!newTransaction) {
            console.error('Transação criada mas não encontrada')
            return false
          }

          // Adiciona ao controle
          const newControl: GeneratedIncomeTransaction = {
            incomeId,
            month,
            transactionId: newTransaction.id,
            generatedAt: new Date().toISOString()
          }

          set((state) => ({
            transactionControl: {
              fixedIncomeTransactions: [...state.transactionControl.fixedIncomeTransactions, newControl]
            }
          }))

          console.log('Transação criada com sucesso:', newTransaction.id)
          return true

        } catch (error) {
          console.error('Erro ao criar transação:', error)
          return false
        }
      },

      undoTransactionForIncome: (incomeId, month) => {
        const existingTransaction = get().transactionControl.fixedIncomeTransactions
          .find(t => t.incomeId === incomeId && t.month === month)

        if (!existingTransaction) return false

        // Remove a transação
        const transactionStore = useTransactionStore.getState()
        transactionStore.removeTransaction(existingTransaction.transactionId)

        // Remove do controle
        set((state) => ({
          transactionControl: {
            fixedIncomeTransactions: state.transactionControl.fixedIncomeTransactions
              .filter(t => !(t.incomeId === incomeId && t.month === month))
          }
        }))

        return true
      },

      hasTransactionForMonth: (incomeId, month) => {
        return get().transactionControl.fixedIncomeTransactions
          .some(t => t.incomeId === incomeId && t.month === month)
      },

      generateMonthlyTransactions: () => {
        const currentDate = new Date()
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
        
        const activeIncomes = get().getActiveIncomes()
        
        activeIncomes.forEach(income => {
          const [year, month] = currentMonth.split('-').map(Number)
          const receiptDate = new Date(year, month - 1, income.receiptDay)
          
          // Só gera se a data de recebimento já passou ou é hoje
          if (receiptDate <= currentDate) {
            get().createTransactionForIncome(income.id, currentMonth)
          }
        })
      },
    }),
    {
      name: 'wallet-fixed-incomes',
    }
  )
) 