'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { ProgressData } from '@/lib/chart-utils';

export interface ProgressLineChartProps {
  data: ProgressData[];
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
        <div className="space-y-2">
          <p className="text-white font-medium">{data.name}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="text-white/80 text-sm">
              进度: <span className="font-semibold text-blue-400">{data.progress}%</span>
            </span>
          </div>
          <p className="text-white/60 text-xs">
            状态: {data.status === 'active' ? '进行中' : 
                   data.status === 'completed' ? '已完成' : 
                   data.status === 'review' ? '审核中' : '草稿'}
          </p>
        </div>
      </motion.div>
    );
  }
  return null;
};

// 自定义圆点组件
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  return (
    <motion.circle
      initial={{ r: 0, opacity: 0 }}
      animate={{ r: 6, opacity: 1 }}
      transition={{ duration: 0.4, delay: payload.index * 0.1 }}
      cx={cx}
      cy={cy}
      fill={payload.color}
      stroke="#ffffff"
      strokeWidth={2}
      className="hover:r-8 transition-all cursor-pointer"
    />
  );
};

const ProgressLineChart: React.FC<ProgressLineChartProps> = ({
  data,
  title = "计划进度分布",
  className = ""
}) => {
  const avgProgress = Math.round(data.reduce((sum, item) => sum + item.progress, 0) / data.length);
  const completedCount = data.filter(item => item.progress === 100).length;
  const inProgressCount = data.filter(item => item.progress > 0 && item.progress < 100).length;

  // 为图表数据添加索引用于动画延迟
  const chartData = data.map((item, index) => ({ ...item, index }));

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
          平均进度 <span className="font-semibold text-blue-400">{avgProgress}%</span>，
          已完成 <span className="font-semibold text-green-400">{completedCount}</span> 个
        </p>
      </div>

      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#007AFF"
              strokeWidth={3}
              fill="url(#progressGradient)"
              dot={<CustomDot />}
              activeDot={{ r: 8, stroke: '#007AFF', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-black/20 rounded-xl p-4 border border-white/5 text-center"
        >
          <div className="text-2xl font-bold text-green-400 mb-1">{completedCount}</div>
          <div className="text-white/60 text-sm">已完成</div>
          <div className="text-xs text-white/40 mt-1">
            {data.length > 0 ? ((completedCount / data.length) * 100).toFixed(1) : 0}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-black/20 rounded-xl p-4 border border-white/5 text-center"
        >
          <div className="text-2xl font-bold text-blue-400 mb-1">{inProgressCount}</div>
          <div className="text-white/60 text-sm">进行中</div>
          <div className="text-xs text-white/40 mt-1">
            {data.length > 0 ? ((inProgressCount / data.length) * 100).toFixed(1) : 0}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-black/20 rounded-xl p-4 border border-white/5 text-center"
        >
          <div className="text-2xl font-bold text-purple-400 mb-1">{avgProgress}%</div>
          <div className="text-white/60 text-sm">平均进度</div>
          <div className="text-xs text-white/40 mt-1">
            整体完成度
          </div>
        </motion.div>
      </div>

      {/* 进度区间分布 */}
      <div className="mt-6">
        <h4 className="text-white/80 font-medium text-center mb-4">进度区间分布</h4>
        <div className="space-y-2">
          {[
            { range: '0-25%', color: '#FF3B30', count: data.filter(item => item.progress <= 25).length },
            { range: '26-50%', color: '#FF9500', count: data.filter(item => item.progress > 25 && item.progress <= 50).length },
            { range: '51-75%', color: '#007AFF', count: data.filter(item => item.progress > 50 && item.progress <= 75).length },
            { range: '76-100%', color: '#34C759', count: data.filter(item => item.progress > 75).length },
          ].map((range, index) => (
            <motion.div
              key={range.range}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              className="flex items-center justify-between bg-black/20 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: range.color }}
                />
                <span className="text-white/80 text-sm">{range.range}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{range.count}</span>
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.length > 0 ? (range.count / data.length) * 100 : 0}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className="h-2 rounded-full"
                    style={{ backgroundColor: range.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressLineChart; 