'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { FinanceRecord, User, getCurrentUser, getBoundUser } from '@/lib/mock-together-data'
import { useTogetherStore } from '@/lib/stores/useTogetherStore'
import { X, Check, User as UserIcon } from 'lucide-react'
import { FINANCE_CATEGORIES } from '@/lib/mock-together-data'

export interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: FinanceRecord | null;
}

type FormData = {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string; // use string for date input
  tags: string; // comma-separated tags
  createdBy: string; // User ID
};

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, recordToEdit }) => {
  const { addRecord, updateRecord } = useTogetherStore();
  const { register, handleSubmit, control, reset, setValue, watch } = useForm<FormData>();
  
  const currentUser = getCurrentUser();
  const boundUser = getBoundUser(currentUser.id);
  const users = [currentUser, boundUser].filter(Boolean) as User[];
  
  const transactionType = watch('type', recordToEdit?.type || 'expense');

  useEffect(() => {
    if (recordToEdit) {
      reset({
        ...recordToEdit,
        amount: Math.abs(recordToEdit.amount),
        date: new Date(recordToEdit.date).toISOString().split('T')[0],
        tags: recordToEdit.tags?.join(', ') || '',
        createdBy: recordToEdit.createdBy,
      });
    } else {
      reset({
        type: 'expense',
        amount: 0,
        description: '',
        category: FINANCE_CATEGORIES[0],
        date: new Date().toISOString().split('T')[0],
        tags: '',
        createdBy: currentUser.id, // Default to current user
      });
    }
  }, [recordToEdit, reset, currentUser.id]);

  const onSubmit = (data: FormData) => {
    const finalData = {
      ...data,
      amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
      date: new Date(data.date),
      tags: data.tags.replace(/，/g, ',').split(',').map(tag => tag.trim()).filter(Boolean),
    };
    
    if (recordToEdit) {
      updateRecord({ ...finalData, id: recordToEdit.id, createdAt: recordToEdit.createdAt });
    } else {
      addRecord(finalData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/10 w-full max-w-md"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white mb-2">{recordToEdit ? '编辑记录' : '添加记录'}</h2>

              {/* Created by */}
              <Controller
                name="createdBy"
                control={control}
                defaultValue={currentUser.id}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-gray-400">为谁记账?</label>
                    <div className="grid grid-cols-2 gap-2 bg-[#2c2c2e] p-1 rounded-lg">
                      {users.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => field.onChange(user.id)}
                          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${field.value === user.id ? 'bg-[#3a3a3c] text-white' : 'text-gray-400'}`}
                        >
                          <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full"/>
                          <span>{user.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />

              {/* Transaction Type */}
              <Controller
                name="type"
                control={control}
                defaultValue="expense"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 bg-[#2c2c2e] p-1 rounded-lg">
                    <button type="button" onClick={() => field.onChange('expense')} className={`px-4 py-2 text-sm rounded-md transition-colors ${field.value === 'expense' ? 'bg-[#3a3a3c] text-white' : 'text-gray-400'}`}>支出</button>
                    <button type="button" onClick={() => field.onChange('income')} className={`px-4 py-2 text-sm rounded-md transition-colors ${field.value === 'income' ? 'bg-[#3a3a3c] text-white' : 'text-gray-400'}`}>收入</button>
                  </div>
                )}
              />

              {/* Amount */}
              <input type="number" step="0.01" {...register('amount', { required: true, valueAsNumber: true })} placeholder="金额" className="input-style" />
              
              {/* Description */}
              <input {...register('description', { required: true })} placeholder="描述" className="input-style" />
              
              {/* Category */}
              <select {...register('category')} className="input-style">
                {FINANCE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date */}
              <input type="date" {...register('date')} className="input-style" />

              {/* Tags */}
              <input {...register('tags')} placeholder="标签 (用逗号分隔)" className="input-style" />

              {/* Actions */}
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

// Add a shared style for inputs for consistency
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
      }
      .input-style:focus {
        outline: none;
        border-color: #0a84ff;
      }
    `}</style>
);

TransactionForm.displayName = 'TransactionForm'

const TransactionFormWithStyles: React.FC<TransactionFormProps> = (props) => (
    <>
        <InputStyleInjector />
        <TransactionForm {...props} />
    </>
)

export default TransactionFormWithStyles; 