'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FinanceRecord } from '@/lib/mock-together-data'
import { cn } from '@/lib/utils'
import { EyeOff, Send, Coffee, Car, Gamepad2, ShoppingBag, Dumbbell, Home, GraduationCap, MoreHorizontal, TrendingUp } from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  '餐饮': <Coffee className="w-4 h-4" />,
  '交通': <Car className="w-4 h-4" />,
  '娱乐': <Gamepad2 className="w-4 h-4" />,
  '购物': <ShoppingBag className="w-4 h-4" />,
  '健康': <Dumbbell className="w-4 h-4" />,
  '住房': <Home className="w-4 h-4" />,
  '教育': <GraduationCap className="w-4 h-4" />,
  '工资': <TrendingUp className="w-4 h-4" />,
  '其他': <MoreHorizontal className="w-4 h-4" />
}

const categoryColors: Record<string, string> = {
  '餐饮': 'bg-orange-500/20 text-orange-400',
  '交通': 'bg-blue-500/20 text-blue-400',
  '娱乐': 'bg-purple-500/20 text-purple-400',
  '购物': 'bg-pink-500/20 text-pink-400',
  '健康': 'bg-green-500/20 text-green-400',
  '住房': 'bg-yellow-500/20 text-yellow-400',
  '教育': 'bg-indigo-500/20 text-indigo-400',
  '工资': 'bg-emerald-500/20 text-emerald-400',
  '其他': 'bg-gray-500/20 text-gray-400'
}

export interface TransactionDetailModalProps {
  record: FinanceRecord | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ record, onClose }) => {
  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+¥${amount.toLocaleString()}` : `-¥${Math.abs(amount).toLocaleString()}`
  }

  return (
    <AnimatePresence>
      {record && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">交易详情</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                title="关闭详情"
              >
                <EyeOff className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', categoryColors[record.category])}>
                  {categoryIcons[record.category]}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{record.description}</p>
                  <p className="text-sm text-gray-400">{record.category}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4">
                <p className={cn(
                  'text-3xl font-bold',
                  record.type === 'income' ? 'text-green-400' : 'text-red-400'
                )}>
                  {formatAmount(record.amount)}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(record.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              
              {record.tags && record.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2 font-medium">标签</p>
                  <div className="flex flex-wrap gap-2">
                    {record.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-xs bg-white/10 text-gray-300 rounded-full border border-white/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {record.type === 'expense' && (
              <div className="mt-6 pt-6 border-t border-white/10">
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500/80 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all"
                  >
                      <Send className="w-4 h-4" />
                      <span>发起报账</span>
                  </motion.button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

TransactionDetailModal.displayName = 'TransactionDetailModal' 