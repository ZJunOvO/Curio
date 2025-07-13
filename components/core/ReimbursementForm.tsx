'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { ReimbursementRequest, FinanceRecord, getCurrentUser, getBoundUser } from '@/lib/mock-together-data'
import { useTogetherStore } from '@/lib/stores/useTogetherStore'
import { useReimbursementStore } from '@/lib/stores/useReimbursementStore'
import { HelpCircle } from 'lucide-react'
import { useUIStore } from '@/lib/stores/useUIStore'

// 固定的随机报账范围常量
const RANDOM_AMOUNT_MIN = 1
const RANDOM_AMOUNT_MAX = 45

export interface ReimbursementFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestionOptions = [
  { type: 'full', label: '全额报账' },
  { type: 'half', label: '-50%报账' },
  { type: 'random', label: '范围随机' },
  { type: 'custom', label: '自定义金额' },
] as const;

const SUGGESTION_DAILY_LIMIT = 3; // 每日建议报账模式的默认限制

type SuggestionType = typeof suggestionOptions[number]['type'];

type FormData = {
  transactionId: string;
  description: string;
  mode: 'suggest' | 'request';
  suggestionType?: SuggestionType;
  suggestedAmount?: number;
};

export const ReimbursementForm: React.FC<ReimbursementFormProps> = ({ isOpen, onClose }) => {
  const { financeRecords, addReimbursementRequest } = useTogetherStore();
  const { getUsage, useOnce: recordUsage } = useReimbursementStore();
  const { handleSubmit, control, watch, setValue, register, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      mode: 'suggest',
      suggestionType: 'full'
    }
  });
  const expenseRecords = financeRecords.filter(r => r.type === 'expense' && !r.reimbursed);
  const selectedMode = watch('mode');
  const selectedSuggestionType = watch('suggestionType');
  const selectedTransactionId = watch('transactionId');
  const selectedTransaction = useMemo(() => 
    expenseRecords.find(r => r.id === selectedTransactionId), 
    [selectedTransactionId, expenseRecords]
  );

  const onSubmit = (data: FormData) => {
    if (!selectedTransaction) return;

    if (data.suggestionType === 'custom') {
      if (typeof data.suggestedAmount === 'number' && isNaN(data.suggestedAmount)) {
        data.suggestedAmount = undefined;
      }
    }

    const finalRequest = {
      ...data,
      fromUser: getCurrentUser().id,
      toUser: getBoundUser(getCurrentUser().id)!.id,
      originalAmount: Math.abs(selectedTransaction.amount),
    };

    if (finalRequest.mode === 'suggest' && finalRequest.suggestionType) {
        if (finalRequest.suggestionType === 'half') {
            finalRequest.suggestedAmount = finalRequest.originalAmount / 2;
        } else if (finalRequest.suggestionType === 'full') {
            finalRequest.suggestedAmount = finalRequest.originalAmount;
        } else if (finalRequest.suggestionType === 'random') {
            // 使用1到原金额的随机范围
            finalRequest.suggestedAmount = Math.floor(Math.random() * finalRequest.originalAmount) + 1;
        }

        if (finalRequest.suggestionType !== 'custom') {
            recordUsage(finalRequest.suggestionType);
        }
    }
    
    addReimbursementRequest(finalRequest as any); // TODO: Fix type
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
              <h2 className="text-xl font-bold text-white mb-2">发起报账</h2>

              <select {...register("transactionId", { required: "请选择一笔支出" })} className="input-style">
                <option value="">选择一笔支出</option>
                {expenseRecords.map(r => <option key={r.id} value={r.id}>{r.description} (-¥{Math.abs(r.amount)})</option>)}
              </select>

              <input {...register("description")} placeholder="报账内容 (可选)" className="input-style"/>

              <Controller
                name="mode"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2 bg-[#2c2c2e] p-1 rounded-lg">
                    <button type="button" onClick={() => field.onChange('suggest')} className={`btn-tab ${field.value === 'suggest' && 'active'}`}>我来建议</button>
                    <button type="button" onClick={() => field.onChange('request')} className={`btn-tab ${field.value === 'request' && 'active'}`}>对方选择</button>
                  </div>
                )}
              />

              {selectedMode === 'suggest' && (
                <Controller
                  name="suggestionType"
                  control={control}
                  render={({ field }) => (
                    <div className="p-3 bg-black/20 rounded-lg space-y-3">
                      <p className="text-sm text-gray-400 font-medium">建议方式:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {suggestionOptions.map(opt => {
                          const isLimited = opt.type !== 'custom';
                          
                          if (isLimited) {
                            const usage = getUsage(opt.type);
                            const limit = SUGGESTION_DAILY_LIMIT;
                            const remaining = limit - usage.count;
                            const isDisabled = remaining <= 0;

                          return (
                            <button
                              key={opt.type}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => field.onChange(opt.type)}
                              className={`p-2 text-sm rounded-md text-left transition-all ${field.value === opt.type ? 'bg-white/10 ring-2 ring-purple-500' : 'bg-white/5'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                            >
                              <p className="font-semibold text-white">{opt.label}</p>
                              <p className="text-xs text-gray-500">
                                  {`今日剩余 ${remaining} 次`}
                                </p>
                              </button>
                            )
                          }
                          
                          // For 'custom' type
                          return (
                            <button
                              key={opt.type}
                              type="button"
                              onClick={() => field.onChange(opt.type)}
                              className={`p-2 text-sm rounded-md text-left transition-all ${field.value === opt.type ? 'bg-white/10 ring-2 ring-purple-500' : 'bg-white/5'} hover:bg-white/10`}
                            >
                              <p className="font-semibold text-white">{opt.label}</p>
                              <p className="text-xs text-gray-500">无限制</p>
                            </button>
                          )
                        })}
                      </div>
                      {selectedSuggestionType === 'custom' && (
                        <input
                          {...register('suggestedAmount', {
                            valueAsNumber: true,
                            validate: value => !value || !isNaN(value) || "请输入有效数字"
                          })}
                          type="number"
                          step="0.01"
                          placeholder="输入自定义金额 (可留空)"
                          className="input-style mt-2"
                        />
                      )}
                    </div>
                  )}
                />
              )}

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={onClose} className="btn-secondary">取消</button>
                <button type="submit" className="btn-primary">发送请求</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const StyleInjector = () => (
    <style jsx global>{`
      .input-style { background-color: #2c2c2e; border: 1px solid #3a3a3c; color: white; padding: 0.75rem 1rem; border-radius: 0.5rem; width: 100%; }
      .btn-tab { padding: 0.5rem 1rem; font-size: 0.875rem; border-radius: 0.375rem; transition: background-color 0.2s; color: #8e8e93; }
      .btn-tab.active { background-color: #3a3a3c; color: white; }
      .btn-primary { padding: 0.5rem 1rem; border-radius: 0.5rem; background-color: #0a84ff; color: white; font-weight: bold; }
      .btn-secondary { padding: 0.5rem 1rem; border-radius: 0.5rem; background-color: #3a3a3c; color: #f2f2f7; }
    `}</style>
);

const ReimbursementFormWithStyles = (props: ReimbursementFormProps) => (
  <>
    <StyleInjector />
    <ReimbursementForm {...props} />
  </>
)

export default ReimbursementFormWithStyles; 