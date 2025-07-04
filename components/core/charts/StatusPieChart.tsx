'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { StatusDistributionData } from '@/lib/chart-utils';

export interface StatusPieChartProps {
  data: StatusDistributionData[];
  title?: string;
  className?: string;
}

// 自定义Tooltip组件
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          />
          <div>
            <p className="text-white font-medium">{data.name}</p>
            <p className="text-white/60 text-sm">{data.description}</p>
            <p className="text-white/80 text-sm mt-1">
              数量: <span className="font-semibold">{data.value}</span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

// 自定义Label组件
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // 不显示小于5%的标签
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// 自定义图例组件
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {payload.map((entry: any, index: number) => (
        <motion.div
          key={`legend-${index}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2 bg-gray-800/50 px-3 py-2 rounded-lg backdrop-blur-sm"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80 text-sm font-medium">
            {entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export const StatusPieChart: React.FC<StatusPieChartProps> = ({
  data,
  title = "计划状态分布",
  className = ""
}) => {
  const totalPlans = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 ${className}`}
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm">
          总计 <span className="font-semibold text-blue-400">{totalPlans}</span> 个计划
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 数据概览 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.slice(0, 4).map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
            className="bg-black/20 rounded-xl p-3 border border-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white/80 text-sm">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}</span>
            </div>
            <div className="mt-1">
              <div className="flex justify-between text-xs text-white/50">
                <span>占比</span>
                <span>{((item.value / totalPlans) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StatusPieChart; 