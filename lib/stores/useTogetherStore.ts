import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { FinanceRecord, mockFinanceRecords, ReimbursementRequest, mockReimbursementRequests, TodoItem, mockTodos } from '@/lib/mock-together-data'

export interface TogetherState {
  financeRecords: FinanceRecord[];
  reimbursementRequests: ReimbursementRequest[];
  todos: TodoItem[];
  
  addRecord: (record: Omit<FinanceRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (record: FinanceRecord) => void;
  deleteRecord: (id: string) => void;
  addReimbursementRequest: (request: Omit<ReimbursementRequest, 'id' | 'createdAt' | 'requestDate' | 'status'>) => void;
  updateReimbursementRequest: (requestId: string, newDescription: string) => void;
  deleteReimbursementRequest: (requestId: string) => void;
  confirmReimbursement: (requestId: string, finalAmount: number, finalMode: ReimbursementRequest['finalMode']) => void;

  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt' | 'isCompleted'>) => void;
  updateTodo: (todo: TodoItem) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
}

export const useTogetherStore = create<TogetherState>()(
  persist(
    (set) => ({
      // Finance state and actions
      financeRecords: mockFinanceRecords,
      reimbursementRequests: mockReimbursementRequests,
      addRecord: (record) => set((state) => ({
        financeRecords: [
          { ...record, id: `finance-${Date.now()}`, createdAt: new Date() },
          ...state.financeRecords,
        ]
      })),
      updateRecord: (updatedRecord) => set((state) => ({
        financeRecords: state.financeRecords.map(r => 
          r.id === updatedRecord.id ? updatedRecord : r
        )
      })),
      deleteRecord: (id) => set((state) => ({
        financeRecords: state.financeRecords.filter(r => r.id !== id)
      })),
      addReimbursementRequest: (request) => set((state) => {
        const newRequest: ReimbursementRequest = {
          ...request,
          id: `reimburse-${Date.now()}`,
          createdAt: new Date(),
          requestDate: new Date(),
          status: 'pending',
        };
        const updatedRecords = state.financeRecords.map(r => 
          r.id === request.transactionId ? { ...r, reimbursed: true } : r
        );
        return {
          reimbursementRequests: [newRequest, ...state.reimbursementRequests],
          financeRecords: updatedRecords,
        };
      }),

      updateReimbursementRequest: (requestId, newDescription) => set(state => ({
        reimbursementRequests: state.reimbursementRequests.map(req =>
          req.id === requestId ? { ...req, description: newDescription } : req
        )
      })),
      
      deleteReimbursementRequest: (requestId) => set(state => {
        const requestToDelete = state.reimbursementRequests.find(r => r.id === requestId);
        if (!requestToDelete) return state;

        const updatedRecords = state.financeRecords.map(r => 
          r.id === requestToDelete.transactionId ? { ...r, reimbursed: false } : r
        );

        return {
          reimbursementRequests: state.reimbursementRequests.filter(r => r.id !== requestId),
          financeRecords: updatedRecords,
        };
      }),

      confirmReimbursement: (requestId, finalAmount, finalMode) => set(state => ({
        reimbursementRequests: state.reimbursementRequests.map(req => 
          req.id === requestId 
            ? { ...req, status: 'confirmed', finalAmount, finalMode, confirmedAt: new Date() } 
            : req
        )
      })),

      // Todo state and actions
      todos: mockTodos,
      addTodo: (todo) => set((state) => ({
        todos: [
          { ...todo, id: `todo-${Date.now()}`, createdAt: new Date(), isCompleted: false },
          ...state.todos
        ]
      })),
      updateTodo: (updatedTodo) => set((state) => ({
        todos: state.todos.map(t => t.id === updatedTodo.id ? updatedTodo : t)
      })),
      deleteTodo: (id) => set((state) => ({
        todos: state.todos.filter(t => t.id !== id)
      })),
      toggleTodo: (id) => set((state) => ({
        todos: state.todos.map(t => 
          t.id === id ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date() : undefined } : t
        )
      })),
    }),
    {
      name: 'together-storage', 
      storage: createJSONStorage(() => localStorage), 
    }
  )
) 