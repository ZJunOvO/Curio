'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Target,
  Users,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
// 使用any类型，因为组件应该独立于具体数据类型
import {
  getPlanStatusDistribution,
  getPlanCategoryDistribution,
  getPlanProgressData,
  getBudgetData,
  getOverallTaskData,
  getMonthlyCreationTrend,
  getMemberParticipation,
  getPlanHealthData,
  chartColors
} from '@/lib/chart-utils';
import StatusPieChart from './StatusPieChart';
import CategoryBarChart from './CategoryBarChart';
import ProgressLineChart from './ProgressLineChart';

export interface PlanStatsDashboardProps {
  plans: any[]; // 使用any类型支持Supabase数据格式
  className?: string;
}

// 统计卡片组件
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  delay?: number;
}> = ({ title, value, subtitle, icon, color, trend, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h3 className="text-white/60 text-sm font-medium mb-2">{title}</h3>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {subtitle && (
          <p className="text-white/50 text-xs">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
    </div>
  </motion.div>
);

// 小型图表组件
const MiniChart: React.FC<{
  title: string;
  children: React.ReactNode;
  delay?: number;
}> = ({ title, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4"
  >
    <h4 className="text-white/80 font-medium mb-3 text-sm">{title}</h4>
    {children}
  </motion.div>
);

const PlanStatsDashboard: React.FC<PlanStatsDashboardProps> = ({
  plans,
  className = ""
}) => {
  // 计算各种统计数据
  const stats = useMemo(() => {
    const statusData = getPlanStatusDistribution(plans);
    const categoryData = getPlanCategoryDistribution(plans);
    const progressData = getPlanProgressData(plans);
    const budgetData = getBudgetData(plans);
    const taskData = getOverallTaskData(plans);
    const monthlyData = getMonthlyCreationTrend(plans);
    const memberData = getMemberParticipation(plans);
    const healthData = getPlanHealthData(plans);

    // 总体统计
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === 'active').length;
    const completedPlans = plans.filter(p => p.status === 'completed').length;
    const avgProgress = Math.round(plans.reduce((sum, p) => sum + p.progress, 0) / totalPlans);
    
    // 预算统计
    const totalBudget = plans.reduce((sum, p) => sum + (p.metrics.totalBudget || 0), 0);
    const spentBudget = plans.reduce((sum, p) => sum + (p.metrics.spentBudget || 0), 0);
    const budgetUtilization = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0;

    // 团队统计
    const uniqueMembers = new Set(plans.flatMap(p => p.members.map(m => m.id))).size;
    
    // 近期创建趋势
    const thisMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
    const thisMonthCount = monthlyData.find(m => m.month === thisMonth)?.count || 0;
    const lastMonthCount = monthlyData.find(m => m.month === lastMonth)?.count || 0;
    const monthlyTrend = lastMonthCount > 0 ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0;

    return {
      statusData,
      categoryData,
      progressData,
      budgetData,
      taskData,
      monthlyData,
      memberData,
      healthData,
      totalPlans,
      activePlans,
      completedPlans,
      avgProgress,
      totalBudget,
      spentBudget,
      budgetUtilization,
      uniqueMembers,
      monthlyTrend
    };
  }, [plans]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">计划统计仪表盘</h1>
        <p className="text-white/60 text-lg">
          全面了解您的计划执行情况和团队协作效果
        </p>
      </motion.div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总计划数"
          value={stats.totalPlans}
          subtitle="所有状态计划"
          icon={<Target size={24} />}
          color={chartColors.primary}
          delay={0.1}
        />
        <StatsCard
          title="进行中"
          value={stats.activePlans}
          subtitle={`${stats.totalPlans > 0 ? Math.round((stats.activePlans / stats.totalPlans) * 100) : 0}% 活跃率`}
          icon={<Activity size={24} />}
          color={chartColors.success}
          delay={0.2}
        />
        <StatsCard
          title="平均进度"
          value={`${stats.avgProgress}%`}
          subtitle="整体完成度"
          icon={<TrendingUp size={24} />}
          color={chartColors.warning}
          delay={0.3}
        />
        <StatsCard
          title="团队成员"
          value={stats.uniqueMembers}
          subtitle="参与计划的成员"
          icon={<Users size={24} />}
          color={chartColors.purple}
          delay={0.4}
        />
      </div>

      {/* 次要指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="已完成"
          value={stats.completedPlans}
          subtitle={`${stats.totalPlans > 0 ? Math.round((stats.completedPlans / stats.totalPlans) * 100) : 0}% 完成率`}
          icon={<Target size={24} />}
          color={chartColors.success}
          delay={0.1}
        />
        <StatsCard
          title="本月新增"
          value={stats.monthlyData.find(m => m.month === new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }))?.count || 0}
          subtitle="计划创建数量"
          icon={<Calendar size={24} />}
          color={chartColors.teal}
          trend={stats.monthlyTrend}
          delay={0.2}
        />
        <StatsCard
          title="总预算"
          value={stats.totalBudget > 0 ? `¥${(stats.totalBudget / 10000).toFixed(1)}万` : '未设置'}
          subtitle={stats.totalBudget > 0 ? `已用 ${stats.budgetUtilization}%` : ''}
          icon={<DollarSign size={24} />}
          color={chartColors.warning}
          delay={0.3}
        />
        <StatsCard
          title="任务完成率"
          value={`${stats.taskData.completionRate}%`}
          subtitle={`${stats.taskData.completedTasks}/${stats.taskData.totalTasks} 个任务`}
          icon={<BarChart3 size={24} />}
          color={chartColors.indigo}
          delay={0.4}
        />
      </div>

      {/* 主要图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusPieChart 
          data={stats.statusData} 
          title="计划状态分布"
        />
        <CategoryBarChart 
          data={stats.categoryData} 
          title="计划分类分布"
        />
      </div>

      {/* 进度分析 */}
      <ProgressLineChart 
        data={stats.progressData} 
        title="计划进度概览"
      />

      {/* 次要图表网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 月度趋势 */}
        <MiniChart title="月度创建趋势" delay={0.1}>
          <div className="space-y-2">
            {stats.monthlyData.slice(-6).map((item, index) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{item.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.count / Math.max(...stats.monthlyData.map(m => m.count))) * 100}%` }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                      className="h-2 rounded-full bg-blue-500"
                    />
                  </div>
                  <span className="text-white text-sm w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </MiniChart>

        {/* 团队参与度 */}
        <MiniChart title="团队参与度" delay={0.2}>
          <div className="space-y-2">
            {stats.memberData.slice(0, 5).map((member, index) => (
              <div key={member.memberName} className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{member.memberName}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(member.planCount / Math.max(...stats.memberData.map(m => m.planCount))) * 100}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                  </div>
                  <span className="text-white text-sm w-6 text-right">{member.planCount}</span>
                </div>
              </div>
            ))}
          </div>
        </MiniChart>

        {/* 计划健康度 */}
        <MiniChart title="计划健康度" delay={0.3}>
          <div className="space-y-2">
            {stats.healthData.slice(0, 5).map((plan, index) => (
              <div key={plan.name} className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{plan.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${plan.healthScore}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                      className={`h-2 rounded-full ${
                        plan.status === 'excellent' ? 'bg-green-500' :
                        plan.status === 'good' ? 'bg-blue-500' :
                        plan.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                  <span className="text-white text-sm w-8 text-right">{plan.healthScore}</span>
                </div>
              </div>
            ))}
          </div>
        </MiniChart>
      </div>
    </div>
  );
};

export default PlanStatsDashboard; 