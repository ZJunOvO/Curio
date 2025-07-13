'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, CheckCircle, Gift, ArrowDownRight, ArrowUpRight, Receipt, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExpenseAnalysisView } from './ExpenseAnalysisView'
import { FinanceRecord } from '@/lib/mock-together-data'

interface StatsCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  label: string;
  value: string;
  detail?: string | React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, iconBgColor, label, value, detail }) => (
  <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBgColor)}>
        {icon}
      </div>
      {detail}
    </div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

export interface StatsDashboardProps {
    monthlyExpense: number;
    totalIncome: number;
    completionRate: number;
    completedTodos: number;
    totalTodos: number;
    totalPendingAmount: number;
    financeRecords: FinanceRecord[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
    monthlyExpense,
    totalIncome,
    completionRate,
    completedTodos,
    totalTodos,
    totalPendingAmount,
    financeRecords,
}) => {
    const [view, setView] = useState<'overview' | 'analysis'>('overview');

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {view === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        <StatsCard
                            icon={<TrendingDown className="w-6 h-6 text-red-400" />}
                            iconBgColor="bg-red-500/20"
                            label="本月支出"
                            value={`¥${monthlyExpense.toLocaleString()}`}
                            detail={<ArrowDownRight className="w-5 h-5 text-red-400" />}
                        />
                        <StatsCard
                            icon={<TrendingUp className="w-6 h-6 text-green-400" />}
                            iconBgColor="bg-green-500/20"
                            label="总收入"
                            value={`¥${totalIncome.toLocaleString()}`}
                            detail={<ArrowUpRight className="w-5 h-5 text-green-400" />}
                        />
                        <StatsCard
                            icon={<CheckCircle className="w-6 h-6 text-blue-400" />}
                            iconBgColor="bg-blue-500/20"
                            label="任务完成率"
                            value={`${completionRate}%`}
                            detail={<span className="text-xs text-gray-400">{completedTodos}/{totalTodos}</span>}
                        />
                        <StatsCard
                            icon={<Gift className="w-6 h-6 text-purple-400" />}
                            iconBgColor="bg-purple-500/20"
                            label="待报账"
                            value={`¥${totalPendingAmount.toLocaleString()}`}
                            detail={<Receipt className="w-5 h-5 text-purple-400" />}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="analysis"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="h-[360px]"
                    >
                        <ExpenseAnalysisView financeRecords={financeRecords} />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                onClick={() => setView(view === 'overview' ? 'analysis' : 'overview')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -top-4 -right-2 bg-white/10 backdrop-blur-lg rounded-full p-2 z-10"
                title="切换视图"
            >
                <PieChart className="w-5 h-5 text-white/80" />
            </motion.button>
        </div>
    );
};

StatsDashboard.displayName = 'StatsDashboard'; 