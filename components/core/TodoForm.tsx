'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { TodoItem, User, getCurrentUser, getBoundUser, TODO_PRIORITIES } from '@/lib/mock-together-data'
import { useTogetherStore } from '@/lib/stores/useTogetherStore'

export interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  todoToEdit?: TodoItem | null;
}

type FormData = {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
};

export const TodoForm: React.FC<TodoFormProps> = ({ isOpen, onClose, todoToEdit }) => {
  const { addTodo, updateTodo } = useTogetherStore();
  const { register, handleSubmit, control, reset } = useForm<FormData>();
  
  const currentUser = getCurrentUser();
  const boundUser = getBoundUser(currentUser.id);
  const users = [currentUser, boundUser].filter(Boolean) as User[];

  useEffect(() => {
    if (todoToEdit) {
      reset({
        ...todoToEdit,
        dueDate: todoToEdit.dueDate ? new Date(todoToEdit.dueDate).toISOString().split('T')[0] : '',
        assignedTo: todoToEdit.assignedTo || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: currentUser.id,
        dueDate: '',
      });
    }
  }, [todoToEdit, reset, currentUser.id]);

  const onSubmit = (data: FormData) => {
    const finalData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      createdBy: todoToEdit ? todoToEdit.createdBy : currentUser.id,
    };
    
    if (todoToEdit) {
      updateTodo({ ...finalData, id: todoToEdit.id, createdAt: todoToEdit.createdAt, isCompleted: todoToEdit.isCompleted });
    } else {
      addTodo(finalData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/10 w-full max-w-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white mb-2">{todoToEdit ? '编辑待办' : '添加待办'}</h2>

              <input {...register('title', { required: true })} placeholder="标题" className="input-style" />
              <textarea {...register('description')} placeholder="描述 (可选)" className="input-style" rows={3}></textarea>
              
              <div className="grid grid-cols-2 gap-4">
                <select {...register('priority')} className="input-style">
                  {TODO_PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                <select {...register('assignedTo')} className="input-style">
                  <option value="">未分配</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <input type="date" {...register('dueDate')} className="input-style" />

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 text-white/80">取消</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 text-white font-bold">保存</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const InputStyleInjector = () => (
    <style jsx global>{`
      .input-style {
        background-color: #2c2c2e;
        border: 1px solid #3a3a3c;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        width: 100%;
        transition: border-color 0.2s;
        appearance: none;
      }
      .input-style:focus {
        outline: none;
        border-color: #0a84ff;
      }
      textarea.input-style {
        resize: vertical;
      }
    `}</style>
);

const TodoFormWithStyles = (props: TodoFormProps) => (
  <>
    <InputStyleInjector />
    <TodoForm {...props} />
  </>
)

export default TodoFormWithStyles 