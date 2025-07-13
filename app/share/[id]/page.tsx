'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Users, Target, TrendingUp,
  CheckCircle, GitBranch, Eye, Sparkles,
  Share2, ExternalLink, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPlanDetails } from '@/lib/supabase/database';

// 从分享ID获取计划数据的函数
const getPlanByShareId = async (shareId: string) => {
  try {
    // 从shareId中提取计划ID（格式：planId-timestamp）
    const planId = shareId.split('-')[0];
    const plan = await getPlanDetails(planId);
    
    return plan;
  } catch (error) {
    console.error('Error fetching shared plan:', error);
    return null;
  }
};

export default function SharePlanPage() {
  const params = useParams();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const shareId = params.id as string;
        const planData = await getPlanByShareId(shareId);
        
        if (planData) {
          setPlan(planData);
        } else {
          setError('分享链接无效或已过期');
        }
      } catch (err) {
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>加载分享内容中...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">访问受限</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 分享页面标识 */}
      <div className="bg-blue-500/10 border-b border-blue-500/20">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-400">这是一个公开分享的计划</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <Eye className="w-4 h-4" />
              <span>只读模式</span>
            </div>
          </div>
        </div>
      </div>

      {/* 英雄区域 */}
      <div className="relative h-96 overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          <img
            src={plan.coverImage}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* 标题信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {plan.priority === 'high' && <Sparkles className="w-6 h-6 text-red-400" />}
                  {plan.priority === 'medium' && <Sparkles className="w-6 h-6 text-yellow-400" />}
                  <h1 className="text-4xl md:text-5xl font-bold">{plan.title}</h1>
                </div>
                <p className="text-lg text-gray-300 max-w-3xl">{plan.description}</p>
                
                {/* 元信息 */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>开始于 {new Date(plan.startDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>目标 {new Date(plan.targetDate).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{plan.members.length} 成员</span>
                  </div>
                </div>
              </div>

              {/* 进度环 */}
              <div className="relative w-32 h-32 hidden md:block">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-white/10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - plan.progress / 100)}`}
                    className={cn(
                      plan.progress >= 80 ? 'text-green-500' :
                      plan.progress >= 50 ? 'text-blue-500' :
                      plan.progress >= 30 ? 'text-yellow-500' :
                      'text-gray-400',
                      "transition-all duration-1000"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{plan.progress}%</span>
                  <span className="text-xs text-gray-400">完成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 指标卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                {
                  label: '任务进度',
                  value: `${plan.metrics.completedTasks}/${plan.metrics.totalTasks}`,
                  icon: CheckCircle,
                  color: 'blue'
                },
                {
                  label: '预算使用',
                  value: plan.metrics.totalBudget
                    ? `¥${(plan.metrics.spentBudget || 0).toLocaleString()}/${plan.metrics.totalBudget.toLocaleString()}`
                    : '未设置',
                  icon: TrendingUp,
                  color: 'green'
                }
              ].map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">{metric.label}</span>
                      <Icon className={cn(
                        'w-5 h-5',
                        metric.color === 'blue' && 'text-blue-400',
                        metric.color === 'green' && 'text-green-400'
                      )} />
                    </div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* 执行路径 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                执行路径
              </h3>
              <div className="space-y-6">
                {plan.paths.map((path, index) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold">{path.title}</h4>
                        <p className="text-gray-400 mt-1">{path.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          path.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          path.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                          path.status === 'paused' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        )}>
                          {path.status === 'completed' ? '已完成' :
                           path.status === 'in_progress' ? '进行中' :
                           path.status === 'paused' ? '已暂停' : '计划中'}
                        </span>
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">进度</span>
                        <span>{path.progress}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={cn(
                            'h-2 rounded-full transition-all duration-500',
                            path.progress >= 100 ? 'bg-green-500' :
                            path.progress >= 50 ? 'bg-blue-500' :
                            'bg-gray-500'
                          )}
                          style={{ width: `${path.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* 里程碑 */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-400">里程碑</h5>
                      {path.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                          {milestone.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className={cn(
                              milestone.completed && 'line-through text-gray-500'
                            )}>
                              {milestone.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(milestone.date).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            {/* 快速信息 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-semibold mb-4">计划信息</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">分类</p>
                  <p className="font-medium capitalize">{plan.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">状态</p>
                  <p className="font-medium">
                    {plan.status === 'draft' ? '草稿' :
                     plan.status === 'review' ? '审核中' :
                     plan.status === 'active' ? '进行中' :
                     plan.status === 'completed' ? '已完成' : '已归档'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">创建者</p>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={plan.creator.avatar}
                      alt={plan.creator.name}
                      className="w-6 h-6 rounded-full"
                      width={24}
                      height={24}
                    />
                    <span>{plan.creator.name}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 标签 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-semibold mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {plan.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 团队成员 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-semibold mb-4">团队成员</h3>
              <div className="space-y-3">
                {plan.members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full"
                      width={32}
                      height={32}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
                {plan.members.length > 5 && (
                  <p className="text-sm text-gray-400">
                    还有 {plan.members.length - 5} 位成员
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>由</span>
              <span className="font-medium text-white">品镜 (Curio)</span>
              <span>强力驱动</span>
            </div>
            <a
              href="/plans"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              创建你的计划
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 