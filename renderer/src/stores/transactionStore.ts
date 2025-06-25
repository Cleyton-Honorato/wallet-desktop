import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface InstallmentInfo {
  total: number // Número total de parcelas
  current: number // Parcela atual
  amount: number // Valor de cada parcela
  totalAmount: number // Valor total da compra
  startDate: string // Data da primeira parcela
}

export interface RecurrenceInfo {
  type: 'weekly' | 'monthly' | 'yearly'
  endDate?: string // Data opcional de término da recorrência
  lastOccurrence: string // Data da última ocorrência gerada
}

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  description?: string
  installments?: InstallmentInfo
  recurrence?: RecurrenceInfo
}

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  getTotalBalance: () => number
  getTotalIncome: () => number
  getTotalExpenses: () => number
  generateRecurringTransactions: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
        }

        // Se for uma transação parcelada, ajusta o valor para o valor da parcela
        if (newTransaction.installments) {
          newTransaction.amount = newTransaction.installments.amount
        }

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }))

        // Se for uma transação recorrente, gera as próximas ocorrências
        if (newTransaction.recurrence) {
          get().generateRecurringTransactions()
        }
      },
      
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },
      
      updateTransaction: (id, updatedTransaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updatedTransaction } : t
          ),
        }))
      },
      
      getTotalBalance: () => {
        const { transactions } = get()
        return transactions.reduce((acc, transaction) => {
          return transaction.type === 'income'
            ? acc + transaction.amount
            : acc - transaction.amount
        }, 0)
      },
      
      getTotalIncome: () => {
        const { transactions } = get()
        return transactions
          .filter((t) => t.type === 'income')
          .reduce((acc, t) => acc + t.amount, 0)
      },
      
      getTotalExpenses: () => {
        const { transactions } = get()
        return transactions
          .filter((t) => t.type === 'expense')
          .reduce((acc, t) => acc + t.amount, 0)
      },

      generateRecurringTransactions: () => {
        const { transactions } = get()
        const now = new Date()
        const oneMonthFromNow = new Date(now)
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)

        // Filtra transações recorrentes que precisam ser geradas
        const recurringTransactions = transactions.filter(t => 
          t.recurrence && 
          new Date(t.recurrence.lastOccurrence) < oneMonthFromNow &&
          (!t.recurrence.endDate || new Date(t.recurrence.endDate) > now)
        )

        // Gera próximas ocorrências
        recurringTransactions.forEach(transaction => {
          const lastDate = new Date(transaction.recurrence!.lastOccurrence)
          let nextDate = new Date(lastDate)

          // Calcula a próxima data baseado no tipo de recorrência
          switch (transaction.recurrence!.type) {
            case 'weekly':
              nextDate.setDate(nextDate.getDate() + 7)
              break
            case 'monthly':
              nextDate.setMonth(nextDate.getMonth() + 1)
              break
            case 'yearly':
              nextDate.setFullYear(nextDate.getFullYear() + 1)
              break
          }

          // Se a próxima data é válida (antes do fim da recorrência e dentro do próximo mês)
          if (
            nextDate <= oneMonthFromNow && 
            (!transaction.recurrence!.endDate || nextDate <= new Date(transaction.recurrence!.endDate))
          ) {
            // Cria nova transação
            const newTransaction: Transaction = {
              ...transaction,
              id: Date.now().toString(),
              date: nextDate.toISOString(),
              recurrence: {
                ...transaction.recurrence!,
                lastOccurrence: nextDate.toISOString()
              }
            }

            // Atualiza a última ocorrência da transação original
            get().updateTransaction(transaction.id, {
              recurrence: {
                ...transaction.recurrence!,
                lastOccurrence: nextDate.toISOString()
              }
            })

            // Adiciona nova transação
            set((state) => ({
              transactions: [...state.transactions, newTransaction]
            }))
          }
        })
      }
    }),
    {
      name: 'wallet-transactions',
    }
  )
) 