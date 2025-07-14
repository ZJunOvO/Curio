'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, X, Calendar, Target, 
  MapPin, CheckCircle, Edit, Trash2, Save, Sparkles, Clock, MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/stores/useToastStore';
import { useAuth } from '@/hooks/useAuth';
import { usePlansCache } from '@/hooks/usePlansCache';
import { createPlan, createPlanPath, createMilestone, addPlanMember } from '@/lib/supabase/database';

interface Milestone {
  id: string;
  title: string;
  date: string;
  notes?: string; // 改为备注字段
  completed: boolean;
}

interface ExecutionPath {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  milestones: Milestone[];
}

interface PlanForm {
  title: string;
  description: string;
  coverImage: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  startDate: string;
  targetDate: string;
  executionPaths: ExecutionPath[];
  tags: string[];
  totalBudget?: number;
  teamEmails: string[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// 从邮箱提取用户名的智能函数
const extractUsernameFromEmail = (email: string): string => {
  const localPart = email.split('@')[0];
  
  // 如果是纯数字，生成更友好的用户名
  if (/^\d+$/.test(localPart)) {
    return `用户${localPart.slice(-4)}`; // 取最后4位数字
  }
  
  // 如果包含数字和字母混合，保留原样
  return localPart;
};

type Step = 'basic' | 'paths' | 'preview';

const BasicInfoStep = React.memo(({ onFormChange, nextStep, onScroll, isHeaderVisible, formData }: { onFormChange: (data: Partial<PlanForm>) => void, nextStep: () => void, onScroll: (e: React.UIEvent<HTMLDivElement>) => void, isHeaderVisible: boolean, formData: PlanForm }) => {
  const [newTag, setNewTag] = useState('');
  const startDateRef = useRef<HTMLInputElement>(null);
  const targetDateRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      onFormChange({ tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onFormChange({ tags: formData.tags.filter(t => t !== tag) });
  };
  return (
    <motion.div key="basic-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: 'absolute' }} transition={{ duration: 0.5 }} className="h-full w-full">
       <div className="h-full bg-black overflow-y-auto" onScroll={onScroll}>
        <div className="max-w-4xl mx-auto space-y-12 px-8 pt-40 pb-12">
           <AnimatePresence>
            {isHeaderVisible && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center absolute top-24 left-1/2 -translate-x-1/2 w-full">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">创建你的新计划</h2>
              </motion.div>
            )}
           </AnimatePresence>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} className="space-y-8">
            <input 
              type="text" 
              name="title" 
              placeholder="计划标题" 
              onChange={(e) => onFormChange({ title: e.target.value })} 
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-white/20 pb-2 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition"
              aria-label="输入计划标题"
            />
            
            <textarea 
              name="description" 
              placeholder="计划描述..." 
              rows={3} 
              onChange={(e) => onFormChange({ description: e.target.value })} 
              className="w-full text-lg bg-white/5 p-4 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 border border-transparent resize-none"
              aria-label="输入计划描述"
            />
            
            {/* 分类和优先级 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-white/60 text-sm">计划分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => onFormChange({ category: e.target.value })}
                  className="w-full bg-gray-800 p-4 rounded-xl text-white focus:outline-none focus:border-white/20 border border-transparent appearance-none"
                  aria-label="选择计划分类"
                >
                  <option value="personal" className="bg-gray-900 text-white">个人计划</option>
                  <option value="career" className="bg-gray-900 text-white">职业发展</option>
                  <option value="learning" className="bg-gray-900 text-white">学习提升</option>
                  <option value="health" className="bg-gray-900 text-white">健康生活</option>
                  <option value="finance" className="bg-gray-900 text-white">财务管理</option>
                  <option value="travel" className="bg-gray-900 text-white">旅行探索</option>
                  <option value="business" className="bg-gray-900 text-white">商业创业</option>
                  <option value="creative" className="bg-gray-900 text-white">创意设计</option>
                  <option value="social" className="bg-gray-900 text-white">社交活动</option>
                  <option value="family" className="bg-gray-900 text-white">家庭生活</option>
                  <option value="hobby" className="bg-gray-900 text-white">兴趣爱好</option>
                  <option value="volunteer" className="bg-gray-900 text-white">志愿服务</option>
                  <option value="project" className="bg-gray-900 text-white">项目管理</option>
                  <option value="research" className="bg-gray-900 text-white">学术研究</option>
                  <option value="event" className="bg-gray-900 text-white">活动策划</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-white/60 text-sm">优先级</label>
                <select
                  value={formData.priority}
                  onChange={(e) => onFormChange({ priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full bg-gray-800 p-4 rounded-xl text-white focus:outline-none focus:border-white/20 border border-transparent appearance-none"
                  aria-label="选择优先级"
                >
                  <option value="low" className="bg-gray-900 text-white">低优先级</option>
                  <option value="medium" className="bg-gray-900 text-white">中优先级</option>
                  <option value="high" className="bg-gray-900 text-white">高优先级</option>
                </select>
              </div>
            </div>
            
            {/* 时间安排 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-white/60 text-sm">开始日期</label>
                  <div className="relative">
                    <input
                      ref={startDateRef}
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={(e) => onFormChange({ startDate: e.target.value })}
                      className="w-full bg-gray-800 p-4 rounded-xl text-white focus:outline-none focus:border-white/20 border border-transparent pr-10"
                      style={{ colorScheme: 'dark' }}
                    />
                    <Calendar 
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 cursor-pointer hover:text-white"
                      onClick={() => startDateRef.current?.showPicker()} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="targetDate" className="block text-white/60 text-sm">目标日期</label>
                  <div className="relative">
                    <input
                      ref={targetDateRef}
                      type="date"
                      id="targetDate"
                      name="targetDate"
                      value={formData.targetDate}
                      onChange={(e) => onFormChange({ targetDate: e.target.value })}
                      className="w-full bg-gray-800 p-4 rounded-xl text-white focus:outline-none focus:border-white/20 border border-transparent pr-10"
                      style={{ colorScheme: 'dark' }}
                    />
                     <Calendar 
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 cursor-pointer hover:text-white"
                      onClick={() => targetDateRef.current?.showPicker()} 
                    />
                  </div>
                </div>
            </div>
            
            {/* 预算设置 */}
            <div className="space-y-2">
              <label className="block text-white/60 text-sm">预算设置（可选）</label>
              <input
                type="number"
                placeholder="输入总预算金额（元）"
                onChange={(e) => onFormChange({ totalBudget: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full bg-gray-800 p-4 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 border border-transparent"
                aria-label="输入总预算金额"
              />
            </div>
            
            {/* 团队成员邮箱 */}
            <div className="space-y-2">
              <label className="block text-white/60 text-sm">团队成员邮箱（可选）</label>
              <textarea
                placeholder="输入团队成员邮箱，每行一个..."
                rows={3}
                onChange={(e) => onFormChange({ 
                  teamEmails: e.target.value
                    .split('\n')
                    .map(email => email.trim())
                    .filter(email => email && email.includes('@'))
                })}
                className="w-full bg-gray-800 p-4 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 border border-transparent resize-none"
                aria-label="输入团队成员邮箱"
              />
              <p className="text-white/40 text-sm">输入邮箱地址，系统会邀请他们协作此计划</p>
            </div>

            {/* 标签选择 */}
            <div className="space-y-2">
              <label className="block text-white/60 text-sm">标签（可选）</label>
              
              {/* 现有标签显示 */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                        aria-label={`移除标签 ${tag}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 添加标签 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="添加标签..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 bg-gray-800 p-3 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-white/20 border border-transparent"
                  aria-label="输入新标签"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  className="px-4 py-3 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="添加标签"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {/* 常用标签快捷选择 */}
              <div className="space-y-2">
                <p className="text-white/40 text-xs">快捷添加：</p>
                <div className="flex flex-wrap gap-2">
                  {['重要', '紧急', '长期', '短期', '个人', '工作', '学习', '健康', '财务', '创意'].map((quickTag) => (
                    <button
                      key={quickTag}
                      type="button"
                      onClick={() => {
                        if (!formData.tags.includes(quickTag)) {
                          onFormChange({ tags: [...formData.tags, quickTag] });
                        }
                      }}
                      disabled={formData.tags.includes(quickTag)}
                      className="px-2 py-1 text-xs bg-gray-800 text-white/60 rounded hover:bg-gray-700 hover:text-white/80 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label={`快速添加标签 ${quickTag}`}
                    >
                      {quickTag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }} className="flex justify-center pt-8">
            <button 
              onClick={nextStep}
              disabled={!formData.title}
              className="px-8 py-4 rounded-full text-lg font-medium bg-white text-black disabled:bg-white/10 disabled:text-white/30 transition hover:scale-105"
              aria-label="进入下一步"
            >
              下一步
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
BasicInfoStep.displayName = "BasicInfoStep";

const PathsStep = React.memo(({ formData, onFormChange, nextStep, prevStep, onScroll, isHeaderVisible }: { 
  formData: PlanForm, 
  onFormChange: (data: Partial<PlanForm>) => void,
  nextStep: () => void,
  prevStep: () => void,
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void,
  isHeaderVisible: boolean
}) => {
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newMilestonePathId, setNewMilestonePathId] = useState<string | null>(null);

  const pathStartDateRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const pathEndDateRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());
  const milestoneDateRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());


  // 添加执行路径
  const addExecutionPath = () => {
    const newPath: ExecutionPath = {
      id: generateId(),
      title: '新执行路径',
      description: '',
      startDate: formData.startDate,
      endDate: formData.targetDate,
      milestones: []
    };
    onFormChange({
      executionPaths: [...formData.executionPaths, newPath]
    });
    setEditingPathId(newPath.id);
  };

  // 删除执行路径
  const deleteExecutionPath = (pathId: string) => {
    onFormChange({
      executionPaths: formData.executionPaths.filter(path => path.id !== pathId)
    });
  };

  // 更新执行路径
  const updateExecutionPath = (pathId: string, updates: Partial<ExecutionPath>) => {
    onFormChange({
      executionPaths: formData.executionPaths.map(path =>
        path.id === pathId ? { ...path, ...updates } : path
      )
    });
  };

  // 添加里程碑
  const addMilestone = (pathId: string) => {
    const newMilestone: Milestone = {
      id: generateId(),
      title: '新里程碑',
      date: '',
      completed: false
    };
    
    const path = formData.executionPaths.find(p => p.id === pathId);
    if (path) {
      updateExecutionPath(pathId, {
        milestones: [...path.milestones, newMilestone]
      });
      setEditingMilestoneId(newMilestone.id);
      
      toast.info(
        '里程碑已添加',
        `已为 "${path.title}" 添加新里程碑，请设置标题和日期。`
      );
    }
  };

  // 删除里程碑
  const deleteMilestone = (pathId: string, milestoneId: string) => {
    const path = formData.executionPaths.find(p => p.id === pathId);
    if (path) {
      const milestone = path.milestones.find(m => m.id === milestoneId);
      updateExecutionPath(pathId, {
        milestones: path.milestones.filter(m => m.id !== milestoneId)
      });
      
      toast.warning(
        '里程碑已删除',
        `已从 "${path.title}" 中删除里程碑 "${milestone?.title || '未命名里程碑'}"。`
      );
    }
  };

  // 更新里程碑
  const updateMilestone = (pathId: string, milestoneId: string, updates: Partial<Milestone>) => {
    const path = formData.executionPaths.find(p => p.id === pathId);
    if (path) {
      updateExecutionPath(pathId, {
        milestones: path.milestones.map(m =>
          m.id === milestoneId ? { ...m, ...updates } : m
        )
      });
    }
  };

  return (
    <motion.div key="paths-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: 'absolute' }} transition={{ duration: 0.5 }} className="h-full w-full">
      <div className="h-full bg-black overflow-y-auto" onScroll={onScroll}>
        <div className="max-w-4xl mx-auto space-y-12 px-8 pt-40 pb-12">
          <AnimatePresence>
            {isHeaderVisible && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center absolute top-24 left-1/2 -translate-x-1/2 w-full">
                <h2 className="text-4xl md:text-5xl font-bold text-white">设计执行路径</h2>
                <p className="text-white/60 mt-2">为你的计划制定详细的执行方案</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 执行路径列表 */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} className="space-y-6">
            {formData.executionPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-white/10"
              >
                {/* 路径标题和操作 */}
                <div className="flex items-center justify-between mb-4">
                  {editingPathId === path.id ? (
                    <input
                      type="text"
                      value={path.title}
                      onChange={(e) => updateExecutionPath(path.id, { title: e.target.value })}
                      onBlur={() => setEditingPathId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingPathId(null)}
                      className="text-xl font-semibold bg-transparent text-white focus:outline-none border-b border-white/30"
                      autoFocus
                      aria-label="执行路径标题"
                    />
                  ) : (
                    <h3 
                      className="text-xl font-semibold text-white cursor-pointer hover:text-white/80"
                      onClick={() => setEditingPathId(path.id)}
                    >
                      {path.title}
                    </h3>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPathId(path.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
                      aria-label="编辑路径标题"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteExecutionPath(path.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      aria-label="删除执行路径"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 路径描述 */}
                <textarea
                  value={path.description}
                  onChange={(e) => updateExecutionPath(path.id, { description: e.target.value })}
                  placeholder="描述这个执行路径的具体内容..."
                  className="w-full bg-gray-800 p-3 rounded-lg text-white placeholder-white/30 focus:outline-none focus:bg-white/10 resize-none mb-4"
                  rows={2}
                  aria-label="执行路径描述"
                />

                {/* 时间范围 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor={`path-start-${path.id}`} className="block text-white/60 text-sm mb-2">开始时间</label>
                    <div className="relative">
                      <input
                        ref={(el) => { pathStartDateRefs.current.set(path.id, el); }}
                        type="date"
                        id={`path-start-${path.id}`}
                        value={path.startDate}
                        onChange={(e) => updateExecutionPath(path.id, { startDate: e.target.value })}
                        className="w-full bg-gray-800 p-3 rounded-lg text-white focus:outline-none focus:bg-white/10 pr-10"
                        style={{ colorScheme: 'dark' }}
                      />
                      <Calendar 
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 cursor-pointer hover:text-white"
                        onClick={() => pathStartDateRefs.current.get(path.id)?.showPicker()}
                        aria-label="打开日期选择器"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`path-end-${path.id}`} className="block text-white/60 text-sm mb-2">结束时间</label>
                     <div className="relative">
                      <input
                        ref={(el) => { pathEndDateRefs.current.set(path.id, el); }}
                        type="date"
                        id={`path-end-${path.id}`}
                        value={path.endDate}
                        onChange={(e) => updateExecutionPath(path.id, { endDate: e.target.value })}
                        className="w-full bg-gray-800 p-3 rounded-lg text-white focus:outline-none focus:bg-white/10 pr-10"
                        style={{ colorScheme: 'dark' }}
                      />
                      <Calendar 
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-white/60 cursor-pointer hover:text-white"
                        onClick={() => pathEndDateRefs.current.get(path.id)?.showPicker()}
                        aria-label="打开日期选择器"
                      />
                    </div>
                  </div>
                </div>

                {/* 里程碑 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white/80 font-medium">里程碑</h4>
                    <button
                      onClick={() => addMilestone(path.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm"
                      aria-label="添加里程碑"
                    >
                      <Plus size={14} />
                      添加里程碑
                    </button>
                  </div>

                  {path.milestones.map((milestone) => (
                    <div 
                      key={milestone.id} 
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg group"
                      onClick={(e) => {
                        // 只有当点击的是容器本身时才触发编辑（不是子元素）
                        if (e.target === e.currentTarget) {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingMilestoneId(milestone.id);
                        }
                      }}
                    >
                      <CheckCircle 
                        size={16} 
                        className={cn(
                          "cursor-pointer transition",
                          milestone.completed ? "text-green-400" : "text-gray-500"
                        )}
                        onClick={() => updateMilestone(path.id, milestone.id, { completed: !milestone.completed })}
                      />
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        {editingMilestoneId === milestone.id ? (
                          <>
                            <input
                              type="text"
                              value={milestone.title}
                              onChange={(e) => updateMilestone(path.id, milestone.id, { title: e.target.value })}
                              onBlur={(e) => {
                                // 延迟处理，允许用户在输入框间切换
                                setTimeout(() => {
                                  if (!e.target.parentElement?.contains(document.activeElement)) {
                                    setEditingMilestoneId(null);
                                  }
                                }, 100);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                  setEditingMilestoneId(null);
                                }
                              }}
                              className="bg-transparent text-white focus:outline-none border-b border-white/30 md:col-span-2"
                              placeholder="里程碑标题"
                              autoFocus
                            />
                            <div className="relative">
                              <input
                                ref={(el) => { milestoneDateRefs.current.set(milestone.id, el); }}
                                type="date"
                                value={milestone.date}
                                onChange={(e) => updateMilestone(path.id, milestone.id, { date: e.target.value })}
                                onBlur={(e) => {
                                  setTimeout(() => {
                                    if (!e.target.parentElement?.parentElement?.contains(document.activeElement)) {
                                      setEditingMilestoneId(null);
                                    }
                                  }, 100);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    setEditingMilestoneId(null);
                                  }
                                }}
                                className="w-full bg-transparent text-white focus:outline-none border-b border-white/30 pr-8"
                                aria-label="里程碑日期"
                                style={{ colorScheme: 'dark' }}
                              />
                              <Calendar 
                                className="absolute top-1/2 right-1 -translate-y-1/2 text-white/60 cursor-pointer hover:text-white"
                                size={14}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  milestoneDateRefs.current.get(milestone.id)?.showPicker();
                                }}
                                aria-label="打开日期选择器"
                              />
                            </div>
                             <div className="relative md:col-span-2">
                              <input
                                type="text"
                                value={milestone.notes || ''}
                                onChange={(e) => updateMilestone(path.id, milestone.id, { notes: e.target.value })}
                                onBlur={(e) => {
                                  setTimeout(() => {
                                    if (!e.target.parentElement?.parentElement?.contains(document.activeElement)) {
                                      setEditingMilestoneId(null);
                                    }
                                  }, 100);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Escape') {
                                    setEditingMilestoneId(null);
                                  }
                                }}
                                placeholder="添加备注..."
                                className="w-full bg-transparent text-white focus:outline-none border-b border-white/30"
                                aria-label="里程碑备注"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <span 
                              className={cn(
                                "cursor-pointer hover:text-white/80 md:col-span-2",
                                milestone.completed ? "line-through text-gray-500" : "text-white"
                              )}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingMilestoneId(milestone.id);
                              }}
                            >
                              {milestone.title}
                            </span>
                            <span 
                              className="text-white/60 flex items-center gap-1 cursor-pointer hover:text-white/80 transition"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingMilestoneId(milestone.id);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              aria-label="点击设置日期"
                            >
                              <Calendar size={12} />
                              {milestone.date || '未设置日期'}
                            </span>
                            <span 
                              className="text-white/60 flex items-center gap-1 cursor-pointer hover:text-white/80 transition md:col-span-2"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditingMilestoneId(milestone.id);
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              aria-label="点击编辑备注"
                            >
                              <MessageCircle size={12} />
                              {milestone.notes || '点击添加备注'}
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => deleteMilestone(path.id, milestone.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition"
                        aria-label="删除里程碑"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {path.milestones.length === 0 && (
                    <div className="text-center py-8 text-white/40 border-2 border-dashed border-white/20 rounded-lg">
                      <Target size={24} className="mx-auto mb-2" />
                      <p>还没有里程碑，点击上方按钮添加</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* 添加新路径按钮 */}
            <motion.button
              onClick={addExecutionPath}
              className="w-full p-8 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all duration-300 flex flex-col items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="添加新的执行路径"
            >
              <Plus size={32} />
              <span className="text-lg font-medium">添加执行路径</span>
              <span className="text-sm text-white/40">制定详细的行动方案</span>
            </motion.button>
          </motion.div>

          {/* 导航按钮 */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }} 
            className="flex justify-between pt-8"
          >
            <button 
              onClick={prevStep}
              className="px-8 py-4 rounded-full text-lg font-medium bg-gray-800 text-white hover:bg-gray-700 transition hover:scale-105"
              aria-label="返回上一步"
            >
              上一步
            </button>
            <button 
              onClick={nextStep}
              disabled={formData.executionPaths.length === 0}
              className="px-8 py-4 rounded-full text-lg font-medium bg-white text-black disabled:bg-white/10 disabled:text-white/30 transition hover:scale-105"
              aria-label="进入预览步骤"
            >
              预览计划
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
PathsStep.displayName = "PathsStep";

const PreviewStep = React.memo(({ formData, onScroll, isHeaderVisible, handleSubmit, prevStep }: { 
  formData: PlanForm,
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void,
  isHeaderVisible: boolean,
  handleSubmit: () => void,
  prevStep: () => void
}) => {
  return (
    <motion.div key="preview-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, position: 'absolute' }} transition={{ duration: 0.5 }} className="h-full w-full">
      <div className="h-full bg-black overflow-y-auto" onScroll={onScroll}>
        <div className="max-w-4xl mx-auto space-y-12 px-8 pt-40 pb-12">
          <AnimatePresence>
            {isHeaderVisible && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center absolute top-24 left-1/2 -translate-x-1/2 w-full">
                <h2 className="text-4xl md:text-5xl font-bold text-white">计划预览</h2>
                <p className="text-white/60 mt-2">确认计划信息，准备创建</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 计划基本信息 */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }} 
            className="bg-gray-800 rounded-xl p-8 border border-white/10"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">{formData.title || '未命名计划'}</h1>
              {formData.description && (
                <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
                  {formData.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
              <div className="bg-gray-800 rounded-lg p-4">
                <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-white/60 text-sm mb-1">开始日期</p>
                <p className="text-white font-medium">
                  {formData.startDate ? new Date(formData.startDate).toLocaleDateString('zh-CN') : '未设置'}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white/60 text-sm mb-1">目标日期</p>
                <p className="text-white font-medium">
                  {formData.targetDate ? new Date(formData.targetDate).toLocaleDateString('zh-CN') : '未设置'}
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <MapPin className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-white/60 text-sm mb-1">执行路径</p>
                <p className="text-white font-medium">{formData.executionPaths.length} 个</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <Sparkles className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-white/60 text-sm mb-1">里程碑</p>
                <p className="text-white font-medium">
                  {formData.executionPaths.reduce((total, path) => total + path.milestones.length, 0)} 个
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-white/60 text-sm mb-1">预算设置</p>
                <p className="text-white font-medium">
                  {formData.totalBudget ? `¥${formData.totalBudget.toLocaleString()}` : '未设置'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 执行路径预览 */}
          {formData.executionPaths.length > 0 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }} 
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-white">执行路径</h3>
              
              {formData.executionPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-2">{path.title}</h4>
                      {path.description && (
                        <p className="text-white/70 mb-4">{path.description}</p>
                      )}
                    </div>
                    <span className="text-white/40 text-sm">路径 {index + 1}</span>
                  </div>

                  {path.startDate && path.endDate && (
                    <div className="flex items-center gap-4 mb-4 text-sm text-white/60">
                      <span>📅 {new Date(path.startDate).toLocaleDateString('zh-CN')}</span>
                      <span>→</span>
                      <span>🎯 {new Date(path.endDate).toLocaleDateString('zh-CN')}</span>
                    </div>
                  )}

                  {path.milestones.length > 0 && (
                    <div>
                      <h5 className="text-white/80 font-medium mb-3">里程碑 ({path.milestones.length})</h5>
                      <div className="space-y-2">
                        {path.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
                            <CheckCircle 
                              size={16} 
                              className={milestone.completed ? "text-green-400" : "text-gray-500"}
                            />
                            <span className={cn(
                              "flex-1",
                              milestone.completed ? "line-through text-gray-500" : "text-white"
                            )}>
                              {milestone.title}
                            </span>
                            {milestone.date && (
                              <span className="text-white/60 text-sm">
                                {new Date(milestone.date).toLocaleDateString('zh-CN')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* 创建按钮 */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }} 
            className="flex justify-between items-center pt-8"
          >
            <button 
              onClick={prevStep}
              className="px-8 py-4 rounded-full text-lg font-medium bg-gray-800 text-white hover:bg-gray-700 transition hover:scale-105"
            >
              上一步
            </button>
            
            <div className="text-center flex-1 mx-8">
              <p className="text-white/60 text-sm mb-4">确认信息无误后，点击创建按钮</p>
              <motion.button 
                onClick={handleSubmit}
                className="px-12 py-4 rounded-full text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={20} />
                  创建计划
                </span>
              </motion.button>
            </div>
            
            <div className="w-32" /> {/* 占位符，保持布局平衡 */}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});
PreviewStep.displayName = "PreviewStep";

export default function CreatePlanPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { preloadPlans, addPlanToCache } = usePlansCache();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isScrolled, setIsScrolled] = useState(false);
  const [formData, setFormData] = useState<PlanForm>({
    title: '',
    description: '',
    coverImage: '',
    category: 'personal',
    priority: 'medium',
    startDate: '',
    targetDate: '',
    executionPaths: [],
    tags: [],
    totalBudget: undefined,
    teamEmails: [],
  });
  
  const [newTag, setNewTag] = useState('');

  // 认证保护
  useEffect(() => {
    if (!loading && !user) {
      toast.error('请先登录', '需要登录才能创建计划');
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/plans');
      if (e.key === 'Enter' && e.metaKey) handleSubmit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onFormChange = useCallback((updates: Partial<PlanForm>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
  };

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('请先登录', '需要登录才能创建计划');
      router.push('/auth/login');
      return;
    }

    // 验证必填字段
    if (!formData.title.trim()) {
      toast.error('标题不能为空', '请输入计划标题');
      return;
    }

    try {
      // 显示创建进度
      toast.info('正在创建计划', '请稍等...');
      
      // 创建计划
      const planData = {
        creator_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        cover_image: formData.coverImage || `https://picsum.photos/seed/${generateId()}/1600/900`,
        category: formData.category,
        priority: formData.priority,
        status: 'draft' as const,
        progress: 0,
        start_date: formData.startDate || null,
        target_date: formData.targetDate || null,
        tags: formData.tags,
        metrics: {
          totalBudget: formData.totalBudget,
          spentBudget: 0,
          totalTasks: formData.executionPaths.reduce((acc, path) => acc + path.milestones.length, 0),
          completedTasks: 0
        }
      };

      console.log('🔍 创建计划数据:', planData);
      console.log('👤 当前用户:', user);
      
      const newPlan = await createPlan(planData);
      console.log('✅ 计划已创建:', newPlan);

      // 创建执行路径和里程碑
      for (const path of formData.executionPaths) {
        const pathData = {
          plan_id: newPlan.id,
          title: path.title,
          description: path.description,
          status: 'planning' as const,
          progress: 0,
          start_date: path.startDate || null,
          end_date: path.endDate || null,
          display_order: formData.executionPaths.indexOf(path)
        };

        console.log('创建路径:', pathData);
        const newPath = await createPlanPath(pathData);
        console.log('路径已创建:', newPath);

        // 创建里程碑
        for (const milestone of path.milestones) {
          const milestoneData = {
            path_id: newPath.id,
            title: milestone.title,
            description: milestone.notes || null,
            date: milestone.date || null,
            completed: milestone.completed,
            display_order: path.milestones.indexOf(milestone)
          };

          console.log('创建里程碑:', milestoneData);
          await createMilestone(milestoneData);
        }
      }

      // TODO: 邀请团队成员
      // for (const email of formData.teamEmails) {
      //   // 根据邮箱查找用户并添加为成员
      // }

      // 优化：将新创建的计划添加到缓存中
      addPlanToCache(newPlan);
      
      toast.success(
        '计划已创建',
        `新计划 "${newPlan.title}" 已成功创建为草稿。`
      );
      router.push(`/plans/${newPlan.id}`);
    } catch (error) {
      console.error('❌ 创建计划失败:', error);
      
      // 根据错误类型提供更详细的错误信息
      if (error.message?.includes('JWT')) {
        toast.error('认证失败', '请重新登录后再试');
        router.push('/auth/login');
      } else if (error.message?.includes('RLS')) {
        toast.error('权限不足', '请检查您的账户权限');
      } else if (error.message?.includes('duplicate key')) {
        toast.error('创建失败', '计划名称已存在，请使用其他名称');
      } else if (error.message?.includes('network')) {
        toast.error('网络错误', '请检查网络连接后重试');
      } else {
        toast.error('创建失败', error.message || '请稍后重试');
      }
    }
  }, [formData, router, user]);

  const nextStep = useCallback(() => {
    const steps: Step[] = ['basic', 'paths', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const steps: Step[] = ['basic', 'paths', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1]);
  }, [currentStep]);

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">正在加载...</p>
        </div>
      </div>
    );
  }

  // 如果用户未登录，显示重定向提示
  if (!user) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">正在跳转到登录页面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black overflow-hidden relative">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => {
          // 优化：在导航前预加载计划列表，减少列表页面加载时间
          preloadPlans();
          router.push('/plans');
        }}
        className="fixed top-8 left-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition"
      >
        <ArrowLeft size={20} />
      </motion.button>

      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {(['basic', 'paths', 'preview'] as Step[]).map((step) => (
          <div key={step} onClick={() => setCurrentStep(step)} className="h-2 rounded-full cursor-pointer transition-all duration-300"
            style={{ width: currentStep === step ? '32px' : '8px', backgroundColor: `rgba(255, 255, 255, ${currentStep === step ? 1 : 0.3})` }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 'basic' && (
            <BasicInfoStep
                formData={formData}
                onFormChange={onFormChange}
                nextStep={nextStep}
                onScroll={handleScroll}
                isHeaderVisible={!isScrolled}
            />
        )}
        {currentStep === 'paths' && <PathsStep
          formData={formData}
          onFormChange={onFormChange}
          nextStep={nextStep}
          prevStep={prevStep}
          onScroll={handleScroll}
          isHeaderVisible={!isScrolled}
        />}
        {currentStep === 'preview' && <PreviewStep
          formData={formData}
          onScroll={handleScroll}
          isHeaderVisible={!isScrolled}
          handleSubmit={handleSubmit}
          prevStep={prevStep}
        />}
      </AnimatePresence>
    </div>
  );
}
