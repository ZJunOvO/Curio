'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CategoryDistributionData } from '@/lib/chart-utils';

export interface CategoryBarChartProps {
  data: CategoryDistributionData[];
  title?: string;
  className?: string;
}

// 自定义Tooltip组件
const CustomTooltip = ({ active, payload, label }: any) => {
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
            <p className="text-white/80 text-sm">
              计划数量: <span className="font-semibold text-blue-400">{data.count}</span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

// 自定义柱子组件
const CustomBar = (props: any) => {
  const { fill, width, height, x, y, payload } = props;
  
  return (
    <motion.rect
      initial={{ height: 0, y: y + height }}
      animate={{ height, y }}
      transition={{ duration: 0.8, delay: payload.index * 0.1, ease: "easeOut" }}
      x={x}
      width={width}
      fill={fill}
      rx={6}
      ry={6}
      className="hover:opacity-80 transition-opacity cursor-pointer"
    />
  );
};

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data,
  title = "计划分类分布",
  className = ""
}) => {
  const maxValue = Math.max(...data.map(item => item.count));
  const totalPlans = data.reduce((sum, item) => sum + item.count, 0);

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
          总计 <span className="font-semibold text-blue-400">{totalPlans}</span> 个计划，
          <span className="font-semibold text-purple-400">{data.length}</span> 个分类
        </p>
      </div>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.map((item, index) => ({ ...item, index }))}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={[0, maxValue + Math.ceil(maxValue * 0.1)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="count" 
              shape={<CustomBar />}
              fill="#007AFF"
            >
              {data.map((entry, index) => (
                <motion.rect
                  key={`bar-${index}`}
                  fill={entry.color}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 排行榜 */}
      <div className="space-y-3">
        <h4 className="text-white/80 font-medium text-center mb-4">分类排行</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                className="bg-black/20 rounded-xl p-3 border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white/80 text-sm">{item.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{item.count}</div>
                  <div className="text-xs text-white/50">
                    {((item.count / totalPlans) * 100).toFixed(1)}%
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryBarChart; 