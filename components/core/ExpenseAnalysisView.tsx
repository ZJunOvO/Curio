'use client'

import React from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { FinanceRecord } from '@/lib/mock-together-data'
import { Coffee, Car, Gamepad2, ShoppingBag, Dumbbell, Home, GraduationCap, MoreHorizontal } from 'lucide-react'

// --- Data Processing & Types ---
interface TreemapDataItem {
  name: string;
  value: number;
  children?: TreemapDataItem[];
  color: string;
  icon: React.ReactNode;
}

const categoryDetails: Record<string, { color: string; icon: React.ReactNode }> = {
  '餐饮': { color: 'hsl(22, 85%, 60%)', icon: <Coffee className="w-4 h-4" /> },
  '交通': { color: 'hsl(210, 85%, 60%)', icon: <Car className="w-4 h-4" /> },
  '娱乐': { color: 'hsl(270, 85%, 65%)', icon: <Gamepad2 className="w-4 h-4" /> },
  '购物': { color: 'hsl(330, 85%, 65%)', icon: <ShoppingBag className="w-4 h-4" /> },
  '健康': { color: 'hsl(140, 70%, 50%)', icon: <Dumbbell className="w-4 h-4" /> },
  '住房': { color: 'hsl(45, 85%, 55%)', icon: <Home className="w-4 h-4" /> },
  '教育': { color: 'hsl(240, 75%, 70%)', icon: <GraduationCap className="w-4 h-4" /> },
  '其他': { color: 'hsl(0, 0%, 65%)', icon: <MoreHorizontal className="w-4 h-4" /> }
};

const processDataForTreemap = (records: FinanceRecord[]): TreemapDataItem[] => {
  const categoryStats = records.reduce((acc, record) => {
    if (record.type === 'expense') {
      const amount = Math.abs(record.amount);
      acc[record.category] = (acc[record.category] || 0) + amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryStats).sort(([, a], [, b]) => b - a);

  const top6 = sortedCategories.slice(0, 6);
  const others = sortedCategories.slice(6);

  const treemapData = top6.map(([name, value]) => ({
    name,
    value,
    ...categoryDetails[name]
  }));

  if (others.length > 0) {
    const othersValue = others.reduce((sum, [, value]) => sum + value, 0);
    treemapData.push({
      name: '其他',
      value: othersValue,
      ...categoryDetails['其他']
    });
  }

  return treemapData;
};

// --- Custom Components for Treemap ---
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value, color } = props;
  const percentage = ((value / root.value) * 100).toFixed(1);

  const canShowText = width > 80 && height > 50;

  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: 'rgba(0,0,0,0.4)',
          strokeWidth: 1.5,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        rx={8}
      />
      {canShowText && (
        <foreignObject x={x + 8} y={y + 8} width={width - 16} height={height - 16} className="text-white overflow-hidden select-none">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="flex flex-col h-full"
          >
            <div className="flex items-center gap-2">
              {categoryDetails[name]?.icon}
              <p className="font-bold text-sm truncate">{name}</p>
            </div>
            <div className="flex-grow" />
            <div className="text-right">
              <p className="font-bold text-lg">¥{value.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
              <p className="text-xs opacity-80">{percentage}%</p>
            </div>
          </motion.div>
        </foreignObject>
      )}
    </g>
  );
};


// --- Main Component ---
export interface ExpenseAnalysisViewProps {
  financeRecords: FinanceRecord[];
}

export const ExpenseAnalysisView: React.FC<ExpenseAnalysisViewProps> = ({ financeRecords }) => {
  const data = processDataForTreemap(financeRecords);
  const totalExpense = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white">支出结构分析</h3>
        <p className="text-sm text-gray-400">总支出: ¥{totalExpense.toLocaleString()}</p>
      </div>
      <div className="flex-grow w-full h-full min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={data}
            dataKey="value"
            stroke="#fff"
            fill="#8884d8"
            content={<CustomizedContent />}
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </ResponsiveContainer>
      </div>
    </div>
  );
};

ExpenseAnalysisView.displayName = 'ExpenseAnalysisView'; 