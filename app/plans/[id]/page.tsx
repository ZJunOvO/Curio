'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Users, Target, TrendingUp,
  CheckCircle, XCircle, MessageCircle, AlertCircle,
  GitBranch, History, UserPlus, MoreVertical,
  Eye, Edit, Trash, ChevronRight, Sparkles,
  Shield, Crown, Zap, Plus, Trash2, BookOpen, Share2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  getPlanDetails, 
  updatePlan, 
  createPlanPath, 
  updatePlanPath, 
  deletePlanPath,
  createMilestone,
  updateMilestone as updateMilestoneDB,
  deleteMilestone as deleteMilestoneDB,
  type Plan 
} from '@/lib/supabase/database';
import { clearPlanCaches } from '@/lib/cache/CacheUtils';
import { toast } from '@/lib/stores/useToastStore';
import { PlanStatsDashboard } from '@/components/core/charts';
import { ShareModal } from '@/components/core';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { uploadImage } from '@/lib/services/uploadService';
import { PlanDetailSkeleton } from '@/components/ui/Skeleton';
import { getCategoryDisplayName, getBudgetDisplayFormat } from '@/lib/utils/categoryMapper';

const generateActivityId = () => `act-${Math.random().toString(36).substr(2, 9)}`;

const createActivity = (
  type: PlanActivity['type'], 
  description: string,
  details?: Record<string, any>
): PlanActivity => {
  return {
    id: generateActivityId(),
    type,
    description,
    timestamp: new Date(),
    actor: { 
      name: '我',
      avatar: 'https://i.pravatar.cc/150?u=user-current'
    },
    details,
  };
};

// 审批组件
const ApprovalSection: React.FC<{ plan: Plan; onUpdate: (updatedPlan: Plan) => void }> = ({ plan, onUpdate }) => {
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<PlanApproval['status']>('pending');

  const getApprovalIcon = (status: PlanApproval['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'discussion': return <MessageCircle className="w-5 h-5 text-yellow-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleSubmitApproval = () => {
    // 模拟提交审批
    const newApproval: PlanApproval = {
      id: Date.now().toString(),
      memberId: 'current-user',
      memberName: '我',
      status: selectedStatus,
      comment: approvalComment,
      createdAt: new Date(),
    };
    
    const activity = createActivity('comment', `发表了审批意见: "${approvalComment}"`);
    // TODO: 实现审批功能，approvals应该是独立的表
    // onUpdate({
    //   ...plan,
    //   approvals: [...(plan.approvals || []), newApproval],
    //   updatedAt: new Date(),
    // });

    toast.success('意见提交成功', '你的审批意见已被记录。');
    setShowApprovalForm(false);
    setApprovalComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">审批状态</h3>
        <button
          onClick={() => setShowApprovalForm(!showApprovalForm)}
          className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm hover:bg-white/20 transition-colors"
        >
          {showApprovalForm ? '取消' : '发表意见'}
        </button>
      </div>

      {/* 审批表单 */}
      <AnimatePresence>
        {showApprovalForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-4">
              {/* 状态选择 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['approved', 'rejected', 'pending', 'discussion'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      selectedStatus === status
                        ? 'bg-white/10 border-white/30'
                        : 'border-white/10 hover:bg-white/5'
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      {getApprovalIcon(status)}
                      <span className="text-xs">
                        {status === 'approved' ? '同意' :
                         status === 'rejected' ? '拒绝' :
                         status === 'discussion' ? '讨论' : '待定'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* 评论输入 */}
              <textarea
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="请输入您的意见或建议..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:border-white/20 focus:outline-none resize-none"
                rows={3}
              />

              {/* 提交按钮 */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowApprovalForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors order-2 sm:order-1"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmitApproval}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors order-1 sm:order-2"
                >
                  提交意见
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 审批列表 */}
      <div className="space-y-3">
        {(plan.approvals || []).map((approval, index) => {
          const member = (plan.plan_members || []).find(m => m.id === approval.memberId);
          return (
            <motion.div
              key={approval.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl"
            >
              <img
                src={member?.avatar || 'https://i.pravatar.cc/150'}
                alt={approval.memberName}
                className="w-10 h-10 rounded-full flex-shrink-0"
                width={40}
                height={40}
              />
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <span className="font-medium">{approval.memberName}</span>
                  <div className="flex items-center gap-2">
                    {getApprovalIcon(approval.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(approval.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                {approval.comment && (
                  <p className="text-sm text-gray-300 mt-2">{approval.comment}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// 版本视图组件
const VersionView: React.FC<{ plan: Plan }> = ({ plan }) => {
  const [selectedVersion, setSelectedVersion] = useState<PlanVersion>(plan.currentVersion);

  const allVersions = [plan.currentVersion, ...plan.versions];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <GitBranch className="w-5 h-5" />
        版本历史
      </h3>

      {/* 版本时间线 */}
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-5 top-8 bottom-0 w-px bg-white/20" />

        <div className="space-y-6">
          {allVersions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative flex gap-4 cursor-pointer',
                version.id === selectedVersion.id && 'opacity-100',
                version.id !== selectedVersion.id && 'opacity-60 hover:opacity-80'
              )}
              onClick={() => setSelectedVersion(version)}
            >
              {/* 时间线节点 */}
              <div className={cn(
                'relative z-10 w-10 h-10 rounded-full flex items-center justify-center',
                version.status === 'active' ? 'bg-blue-500' : 'bg-gray-600'
              )}>
                <History className="w-5 h-5" />
              </div>

              {/* 版本信息 */}
              <div className="flex-1 pb-6">
                <div className={cn(
                  'p-4 rounded-xl transition-all',
                  version.id === selectedVersion.id
                    ? 'bg-white/10 border border-white/20'
                    : 'bg-white/5 border border-white/10'
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{version.title}</h4>
                      <p className="text-sm text-gray-400">
                        v{version.version} · {version.createdBy} · {new Date(version.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      version.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                      version.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                      'bg-gray-600/20 text-gray-400'
                    )}>
                      {version.status === 'active' ? '当前版本' :
                       version.status === 'draft' ? '草稿' : '已归档'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{version.description}</p>
                  
                  {/* 版本变更 */}
                  {version.changes && version.changes.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 mb-1">主要变更：</p>
                      {version.changes.map((change, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {change}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 成员管理组件
const MembersSection: React.FC<{ plan: any, onUpdate: (updates: any) => void }> = ({ plan, onUpdate }) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'collaborator': return <Shield className="w-4 h-4 text-blue-400" />;
      default: return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'creator': return '创建者';
      case 'collaborator': return '协作者';
      default: return '观察者';
    }
  };

  const handleInvite = () => {
    if (inviteEmail && inviteEmail.includes('@')) {
      const activity = createActivity('member', `邀请了新成员: ${inviteEmail}`);
      // TODO: 实现成员邀请功能
      // onUpdate({
      //   ...plan
      // });
      toast.info(`邀请已发送至 ${inviteEmail}`, '成员接受邀请后将出现在列表中。');
      setInviteEmail('');
      setShowInviteForm(false);
    } else {
      toast.error('邮箱地址无效', '请输入一个有效的邮箱地址。');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          团队成员 ({plan.plan_members?.length || 0})
        </h3>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm hover:bg-white/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          邀请成员
        </button>
      </div>

      {/* 邀请表单 */}
      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <input
                type="email"
                placeholder="输入邮箱地址邀请成员..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:border-white/20 focus:outline-none"
              />
              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  取消
                </button>
                <button onClick={handleInvite} className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                  发送邀请
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成员列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(plan.plan_members || []).map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full"
                width={48}
                height={48}
              />
              <div>
                <h4 className="font-medium">{member.name}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {getRoleIcon(member.role)}
                  <span>{getRoleLabel(member.role)}</span>
                </div>
              </div>
            </div>
            {member.role !== 'creator' && (
              <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="成员操作菜单">
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 单个里程碑项组件
const MilestoneItem: React.FC<{
  milestone: any; // 使用 a y 解决临时类型问题
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (updates: Partial<any>) => void;
  onDelete: () => void;
}> = ({ milestone, isEditing, onStartEdit, onCancelEdit, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(milestone.title);

  const handleSave = () => {
    onUpdate({ title });
    toast.success('里程碑已更新', `"${title}" 已被成功保存。`);
    onCancelEdit(); // 退出编辑模式
  };

  const handleToggleComplete = async () => {
    const newStatus = !milestone.completed;
    
    // 乐观更新：先更新UI，再同步数据库
    console.log(`🔄 正在更新里程碑 "${milestone.title}" 状态: ${milestone.completed} → ${newStatus}`);
    
    // 直接调用更新函数，避免双重Toast
    onUpdate({ completed: newStatus });
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg group">
      <button onClick={handleToggleComplete} aria-label={milestone.completed ? '标记为未完成' : '标记为完成'}>
        <motion.div whileTap={{ scale: 0.9 }}>
          {milestone.completed ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
          )}
        </motion.div>
      </button>
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent focus:outline-none"
            autoFocus
            aria-label="里程碑标题"
          />
        ) : (
          <p className={cn(milestone.completed && 'line-through text-gray-500')}>
            {milestone.title}
          </p>
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300" aria-label="保存里程碑">
            <CheckCircle className="w-4 h-4" />
          </button>
          <button onClick={onCancelEdit} className="p-1 text-gray-400 hover:text-white" aria-label="取消编辑">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onStartEdit} className="p-1 text-gray-400 hover:text-white" aria-label="编辑里程碑">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 text-red-400 hover:text-red-300" aria-label="删除里程碑">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// 新里程碑编辑器
const NewMilestoneEditor: React.FC<{
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (title.trim() && !saving) {
      setSaving(true);
      try {
        await onSave(title.trim());
        setTitle('');
      } catch (error) {
        // Error is handled in saveNewMilestone function
      } finally {
        setSaving(false);
      }
    }
  };

  return (
     <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
       <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex-shrink-0" />
       <div className="flex-1">
         <input
           type="text"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="输入新里程碑标题..."
           className="w-full bg-transparent focus:outline-none"
           autoFocus
           onKeyDown={(e) => e.key === 'Enter' && handleSave()}
           aria-label="新里程碑标题"
         />
       </div>
       <div className="flex items-center gap-2">
          <button 
            onClick={handleSave} 
            disabled={saving || !title.trim()}
            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="保存新里程碑"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-white" aria-label="取消添加">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
     </div>
  );
};

// 新路径编辑器
const NewPathEditor: React.FC<{
  onSave: (title: string) => Promise<void>;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (title.trim() && !saving) {
      setSaving(true);
      try {
        await onSave(title.trim());
        setTitle('');
      } catch (error) {
        // Error is handled in addPath function
      } finally {
        setSaving(false);
      }
    }
  };

  return (
     <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl">
       <div className="w-5 h-5 border-2 border-gray-500 rounded-full flex-shrink-0" />
       <div className="flex-1">
         <input
           type="text"
           value={title}
           onChange={(e) => setTitle(e.target.value)}
           placeholder="输入新执行路径标题..."
           className="w-full bg-transparent focus:outline-none"
           autoFocus
           onKeyDown={(e) => e.key === 'Enter' && handleSave()}
           aria-label="新执行路径标题"
         />
       </div>
       <div className="flex items-center gap-2">
          <button 
            onClick={handleSave} 
            disabled={saving || !title.trim()}
            className="p-1 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed" 
            aria-label="保存新路径"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:text-white" aria-label="取消添加">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
     </div>
  );
};

// 计划路径组件 - 最终修复版
const PathsSection: React.FC<{
  plan: any;
  onUpdate: (updates: any) => void;
  onReload: () => void;
}> = ({ plan, onUpdate, onReload }) => {
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newMilestonePathId, setNewMilestonePathId] = useState<string | null>(null);
  const [isAddingPath, setIsAddingPath] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Helper to recalculate plan status ---
  const recalculatePlanStatus = (paths: any[]) => {
    // 改进：基于所有里程碑的完成情况来计算进度，而不仅仅是路径状态
    const totalMilestones = paths.reduce((total, path) => total + (path.milestones?.length || 0), 0);
    
    if (totalMilestones === 0) {
      return { 
        status: plan.status, 
        progress: 0,
        metrics: {
          ...plan.metrics,
          totalTasks: 0,
          completedTasks: 0
        }
      };
    }
    
    const completedMilestones = paths.reduce((total, path) => 
      total + (path.milestones?.filter(m => m.completed)?.length || 0), 0
    );
    
    const progress = Math.round((completedMilestones / totalMilestones) * 100);

    let status: Plan['status'] = plan.status;
    if (progress === 100) {
      status = 'completed';
    } else if (progress > 0) {
      if (plan.status === 'draft' || plan.status === 'review') {
        status = 'active';
      }
    }
    
    // 更新 metrics
    const updatedMetrics = {
      ...plan.metrics,
      totalTasks: totalMilestones,
      completedTasks: completedMilestones
    };
    
    return { status, progress, metrics: updatedMetrics };
  };

  // --- Path Logic ---
  const addPath = async (title: string) => {
    try {
      const pathData = {
        plan_id: plan.id,
        title,
        description: '请填写路径描述',
        start_date: plan.startDate,
        target_date: plan.targetDate,
        status: 'planning',
        progress: 0,
      };
      
      await createPlanPath(pathData);
      toast.success('路径已添加', `新执行路径 "${title}" 已成功创建`);
      setIsAddingPath(false);
      
      // 重新加载计划数据以显示新路径
      onReload();
    } catch (error) {
      console.error('Error adding path:', error);
      toast.error('添加失败', '无法创建新的执行路径');
    }
  };

  const updatePath = async (pathId: string, updates: { title?: string; description?: string }) => {
    try {
      await updatePlanPath(pathId, updates);
      toast.success('执行路径已更新', '路径信息已成功保存');
      
      // 重新加载计划数据以显示更新
      onReload();
    } catch (error) {
      console.error('Error updating path:', error);
      toast.error('更新失败', '无法更新执行路径');
    }
  };

  const deletePath = async (pathId: string) => {
    const pathToDelete = (plan.paths || []).find(p => p.id === pathId);
    if (!pathToDelete) return;

    try {
      await deletePlanPath(pathId);
      toast.warning('执行路径已删除', `路径 "${pathToDelete.title}" 已被删除`);
      
      // 重新加载计划数据以更新进度和状态
      onReload();
    } catch (error) {
      console.error('Error deleting path:', error);
      toast.error('删除失败', '无法删除执行路径');
    }
  };

  const handleUpdatePath = (pathId: string, updates: { title?: string; description?: string }) => {
    updatePath(pathId, updates);
  };

  // --- Milestone Logic ---
  const handleAddNewMilestone = (pathId: string) => {
    setNewMilestonePathId(pathId);
  };
  
  const saveNewMilestone = async (pathId: string, title: string) => {
    try {
      const milestoneData = {
        path_id: pathId,
        title,
        target_date: new Date().toISOString(),
        completed: false,
      };
      
      await createMilestone(milestoneData);
      toast.success('里程碑已添加', `新的里程碑 "${title}" 已成功添加`);
      setNewMilestonePathId(null);
      
      // 重新加载计划数据以显示新里程碑
      onReload();
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('添加失败', '无法创建新的里程碑');
    }
  };

  const cancelAddNewMilestone = () => {
    setNewMilestonePathId(null);
  };

  const updateMilestone = async (pathId: string, milestoneId: string, updates: Partial<any>) => {
    // 保存原始状态以便回滚
    const originalPlan = { ...plan };
    
    try {
      console.log(`💾 正在保存里程碑更新到数据库:`, { milestoneId, updates });
      
      // 先进行乐观更新：立即更新本地状态
      setPlan(prevPlan => {
        const newPlan = { ...prevPlan };
        const path = newPlan.paths?.find(p => p.id === pathId);
        if (path) {
          const milestoneIndex = path.milestones?.findIndex(m => m.id === milestoneId);
          if (milestoneIndex !== undefined && milestoneIndex >= 0 && path.milestones) {
            path.milestones[milestoneIndex] = { ...path.milestones[milestoneIndex], ...updates };
          }
        }
        return newPlan;
      });
      
      // 然后同步到数据库
      await updateMilestoneDB(milestoneId, updates);
      
      const actionText = updates.completed !== undefined 
        ? (updates.completed ? '已完成' : '未完成')
        : '已更新';
      
      console.log(`✅ 里程碑状态更新成功: ${actionText}`);
      
      // 找到里程碑所在的路径和标题
      const path = (plan.paths || []).find(p => p.id === pathId);
      const milestone = path?.milestones?.find(m => m.id === milestoneId);
      const milestoneTitle = milestone?.title || '里程碑';
      
      toast.success(
        '里程碑已更新', 
        `"${milestoneTitle}" 已标记为${actionText}`
      );
      
      // 只有在需要更新进度数据时才重新加载（比如完成状态改变）
      if (updates.completed !== undefined) {
        console.log('🔄 更新计划进度统计...');
        // 延迟重新加载以避免闪烁
        setTimeout(() => {
          onReload();
        }, 500);
      }
      
    } catch (error) {
      console.error('❌ 更新里程碑失败:', error);
      
      // 回滚本地状态
      setPlan(originalPlan);
      
      // 提供更详细的错误信息
      const errorMessage = error.message?.includes('JWT') 
        ? '认证失败，请重新登录'
        : error.message?.includes('RLS') 
        ? '权限不足，无法更新里程碑'
        : '网络错误，请稍后重试';
      
      toast.error('更新失败', errorMessage);
    }
  };

  const deleteMilestone = async (pathId: string, milestoneId: string) => {
    const path = (plan.paths || []).find(p => p.id === pathId);
    if (!path) return;
    const milestone = path.milestones?.find(m => m.id === milestoneId);
    if (!milestone) return;

    try {
      await deleteMilestoneDB(milestoneId);
      toast.warning('里程碑已删除', `里程碑 "${milestone.title}" 已被删除`);
      
      // 重新加载计划数据以更新进度和状态
      onReload();
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast.error('删除失败', '无法删除里程碑');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">执行路径</h3>
        <div className="flex items-center gap-3">
          {/* 状态切换按钮 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">状态：</span>
            <select
              value={plan.status}
              onChange={(e) => {
                const newStatus = e.target.value as Plan['status'];
                const updatedPlan = {
                  ...plan,
                  status: newStatus,
                  updatedAt: new Date()
                };
                onUpdate(updatedPlan);
                
                const statusText = {
                  'draft': '草稿',
                  'active': '进行中',
                  'completed': '已完成', 
                  'review': '审核中',
                  'archived': '已归档'
                };
                
                toast.success(
                  '状态更新成功',
                  `计划状态已更改为：${statusText[newStatus]}`
                );
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
              aria-label="更改计划状态"
            >
              <option value="draft" className="bg-gray-900 text-white">草稿</option>
              <option value="active" className="bg-gray-900 text-white">进行中</option>
              <option value="completed" className="bg-gray-900 text-white">已完成</option>
              <option value="review" className="bg-gray-900 text-white">审核中</option>
              <option value="archived" className="bg-gray-900 text-white">已归档</option>
            </select>
          </div>
          
          <button 
            onClick={() => setIsAddingPath(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition text-sm"
          >
            <Plus size={14} />
            添加新路径
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {(plan.paths || []).map((path, index) => {
          // --- DYNAMIC PROGRESS CALCULATION ---
          const completedMilestones = path.milestones?.filter(m => m.completed)?.length || 0;
          const totalMilestones = path.milestones?.length || 0;
          const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

          return (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-6 rounded-2xl border transition-all',
                path.status === 'in_progress' 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/5 border-white/10'
              )}
            >
              {/* Path Header & Edit section */}
              <div className="flex items-start justify-between mb-4">
                {editingPathId === path.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={path.title}
                      onChange={(e) => updatePath(path.id, { title: e.target.value })}
                      className="w-full text-lg font-semibold bg-white/10 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="路径标题"
                    />
                    <textarea
                      value={path.description}
                      onChange={(e) => updatePath(path.id, { description: e.target.value })}
                      className="w-full text-sm bg-white/10 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      aria-label="路径描述"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold">{path.title}</h4>
                      <button
                        onClick={() => setEditingPathId(path.id)}
                        className="p-1 rounded hover:bg-white/10 transition-colors opacity-50 hover:opacity-100"
                        aria-label="编辑路径标题"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">{path.description}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-4">
                  {editingPathId === path.id && (
                     <button onClick={() => {
                       setEditingPathId(null);
                       toast.success('路径已更新', '执行路径信息已保存。');
                     }} className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600" aria-label="保存路径变更">
                        <CheckCircle className="w-4 h-4" />
                     </button>
                  )}
                  <span className={cn(
                    'px-3 py-1 text-xs rounded-full self-start',
                    path.status === 'completed' && 'bg-green-500/20 text-green-300',
                    path.status === 'in_progress' && 'bg-blue-500/20 text-blue-300',
                    path.status === 'planning' && 'bg-yellow-500/20 text-yellow-300',
                    path.status === 'paused' && 'bg-gray-500/20 text-gray-300'
                  )}>
                    {path.status === 'completed' ? '已完成' :
                     path.status === 'in_progress' ? '进行中' :
                     path.status === 'planning' ? '规划中' : '已暂停'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">进度</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      'h-full rounded-full',
                      progress >= 80 ? 'bg-green-500' :
                      progress >= 50 ? 'bg-blue-500' :
                      progress >= 30 ? 'bg-yellow-500' :
                      'bg-gray-500'
                    )}
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">里程碑</p>
                  <button
                    onClick={() => handleAddNewMilestone(path.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    添加
                  </button>
                </div>

                {(path.milestones || []).map(milestone => (
                  <MilestoneItem
                    key={milestone.id}
                    milestone={milestone}
                    isEditing={editingMilestoneId === milestone.id}
                    onStartEdit={() => setEditingMilestoneId(milestone.id)}
                    onCancelEdit={() => setEditingMilestoneId(null)}
                    onUpdate={(updates) => updateMilestone(path.id, milestone.id, updates)}
                    onDelete={() => deleteMilestone(path.id, milestone.id)}
                  />
                ))}

                {newMilestonePathId === path.id && (
                  <NewMilestoneEditor
                    onSave={(title) => saveNewMilestone(path.id, title)}
                    onCancel={cancelAddNewMilestone}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {isAddingPath && (
        <NewPathEditor 
          onSave={addPath} 
          onCancel={() => setIsAddingPath(false)} 
        />
      )}
    </div>
  );
};

// 活动部分
const ActivitySection: React.FC<{ plan: Plan }> = ({ plan }) => {
  const getActivityIcon = (type: PlanActivity['type']) => {
    switch (type) {
      case 'creation': return <Plus className="w-4 h-4 text-green-400" />;
      case 'update': return <Edit className="w-4 h-4 text-blue-400" />;
      case 'milestone': return <Target className="w-4 h-4 text-purple-400" />;
      case 'status_change': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case 'member': return <UserPlus className="w-4 h-4 text-pink-400" />;
      default: return <History className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
       <h3 className="text-xl font-semibold flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        最新动态
      </h3>
      <div className="relative border-l-2 border-white/10 pl-8 space-y-8">
        {[...(plan.activities || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className="absolute -left-10 top-1 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center border-2 border-black">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex items-center gap-3">
              <img src={activity.actor.avatar} alt={activity.actor.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="text-sm">
                  <span className="font-semibold">{activity.actor.name}</span>
                  <span className="text-gray-400"> {activity.description}</span>
                </p>
                <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 主页面组件
export default function PlanDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'versions' | 'members' | 'approvals' | 'activity' | 'stats'>('overview');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCoverEditor, setShowCoverEditor] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      loadPlan();
    }
  }, [params.id, user]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const planId = params.id as string;
      const planData = await getPlanDetails(planId);
      setPlan(planData);
    } catch (error) {
      console.error('加载计划失败:', error);
      toast.error('加载失败', '无法加载计划详情');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plan) {
    return <PlanDetailSkeleton />;
  }

  const handlePlanUpdate = async (updates: any) => {
    try {
      const updatedPlan = await updatePlan(plan.id, updates);
      setPlan({ ...plan, ...updatedPlan });
      
      // 清除相关缓存，确保下次访问获取最新数据
      clearPlanCaches(plan.id);
      
      toast.success('更新成功', '计划已保存');
    } catch (error) {
      console.error('更新计划失败:', error);
      toast.error('更新失败', '请稍后重试');
    }
  };

  const handleCoverUpload = async (file: File): Promise<string> => {
    try {
      const imageUrl = await uploadImage(file, 'plan-covers');
      
      // 更新计划封面
      await handlePlanUpdate({ cover_image: imageUrl });
      
      toast.success('封面上传成功', '计划封面已更新');
      return imageUrl;
    } catch (error) {
      console.error('封面上传失败:', error);
      toast.error('上传失败', '请检查网络连接后重试');
      throw error;
    }
  };

  const handleCoverChange = (url: string | null) => {
    if (url) {
      setPlan(prev => ({ ...prev, coverImage: url }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
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

        {/* 返回按钮和操作按钮 */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <a
            href="/plans"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </a>
          
          {/* 操作按钮组 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCoverEditor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-white shadow-lg"
            >
              <Edit className="w-4 h-4" />
              编辑封面
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-white shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>

        {/* 标题信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {plan.priority === 'high' && <Zap className="w-6 h-6 text-red-400" />}
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
                    <span>{plan.plan_members?.length || 0} 成员</span>
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
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (plan.progress || 0) / 100)}`}
                    className={cn(
                      (plan.progress || 0) >= 80 ? 'text-green-500' :
                      (plan.progress || 0) >= 50 ? 'text-blue-500' :
                      (plan.progress || 0) >= 30 ? 'text-yellow-500' :
                      'text-gray-400',
                      "transition-all duration-1000"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{plan.progress || 0}%</span>
                  <span className="text-xs text-gray-400">完成</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {[
              { key: 'overview', label: '概览', icon: Eye },
              { key: 'paths', label: '执行路径', icon: GitBranch },
              { key: 'versions', label: '版本历史', icon: History },
              { key: 'members', label: '团队成员', icon: Users },
              { key: 'approvals', label: '审批状态', icon: CheckCircle },
              { key: 'activity', label: '动态', icon: BookOpen },
              { key: 'stats', label: '统计分析', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-lg transition-all whitespace-nowrap',
                  activeTab === key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-6 py-8 scroll-mt-20">
        <AnimatePresence mode="wait">
          {/* 概览 */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* 左侧主要内容 */}
              <div className="lg:col-span-2 space-y-8">
                {/* 指标卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      label: '任务进度',
                      value: `${plan.metrics?.completedTasks || 0}/${plan.metrics?.totalTasks || 0}`,
                      icon: CheckCircle,
                      color: 'blue'
                    },
                    {
                      label: '预算使用',
                      value: getBudgetDisplayFormat(plan.metrics.totalBudget, plan.metrics.spentBudget),
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
                </div>

                {/* 最新动态 */}
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <h3 className="text-xl font-semibold mb-4">最新动态</h3>
                  <div className="space-y-3">
                    {/* 生成一些示例动态 */}
                    {(() => {
                      const activities = [];
                      const now = new Date();
                      
                      // 里程碑完成动态
                      (plan.paths || []).forEach(path => {
                        (path.milestones || []).forEach(milestone => {
                          if (milestone.completed) {
                            activities.push({
                              id: `milestone-${milestone.id}`,
                              type: 'milestone_completed',
                              title: `完成里程碑：${milestone.title}`,
                              description: `在执行路径"${path.title}"中完成了里程碑`,
                              time: milestone.date,
                              icon: '✅'
                            });
                          }
                        });
                      });
                      
                      // 路径状态变更动态
                      (plan.paths || []).forEach(path => {
                        if (path.status === 'in_progress') {
                          activities.push({
                            id: `path-${path.id}`,
                            type: 'path_status_changed',
                            title: `执行路径开始进行`,
                            description: `"${path.title}"已开始执行`,
                            time: path.startDate,
                            icon: '🚀'
                          });
                        } else if (path.status === 'completed') {
                          activities.push({
                            id: `path-completed-${path.id}`,
                            type: 'path_completed',
                            title: `执行路径已完成`,
                            description: `"${path.title}"已成功完成所有里程碑`,
                            time: path.endDate,
                            icon: '🎉'
                          });
                        }
                      });
                      
                      // 计划创建动态
                      activities.push({
                        id: 'plan-created',
                        type: 'plan_created',
                        title: '计划已创建',
                        description: `${plan.creator.name}创建了这个计划`,
                        time: plan.createdAt,
                        icon: '📋'
                      });
                      
                      // 按时间排序，最新的在前
                      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
                      
                      return activities.slice(0, 5); // 只显示最近5条
                    })().map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                        <span className="text-lg mt-0.5">{activity.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{activity.title}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(activity.time).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                    
                    {(() => {
                      // 如果没有动态，显示提示
                      const hasActivities = (plan.paths || []).some(path => 
                        (path.milestones || []).some(m => m.completed) || 
                        path.status !== 'planning'
                      );
                      
                      if (!hasActivities) {
                        return (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Sparkles className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-400">暂无最新动态</p>
                            <p className="text-xs text-gray-500 mt-1">开始执行计划后，这里会显示进度更新</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* 右侧信息 */}
              <div className="space-y-6">
                {/* 快速信息 */}
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">计划信息</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">分类</p>
                      <p className="font-medium">{getCategoryDisplayName(plan.category)}</p>
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
                </div>

                {/* 标签 */}
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <h3 className="text-lg font-semibold mb-4">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {(plan.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/10 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 执行路径 */}
          {activeTab === 'paths' && (
            <motion.div
              key="paths"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PathsSection plan={plan} onUpdate={handlePlanUpdate} onReload={loadPlan} />
            </motion.div>
          )}

          {/* 版本历史 */}
          {activeTab === 'versions' && (
            <motion.div
              key="versions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center text-gray-400 py-8">版本管理功能开发中...</div>
            </motion.div>
          )}

          {/* 团队成员 */}
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MembersSection plan={plan} onUpdate={handlePlanUpdate} />
            </motion.div>
          )}

          {/* 审批状态 */}
          {activeTab === 'approvals' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ApprovalSection plan={plan} onUpdate={handlePlanUpdate} />
            </motion.div>
          )}

          {/* 动态 */}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center text-gray-400 py-8">活动记录功能开发中...</div>
            </motion.div>
          )}

          {/* 统计分析 */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center text-gray-400 py-8">统计面板功能开发中...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 封面编辑模态框 */}
      <AnimatePresence>
        {showCoverEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCoverEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">编辑计划封面</h3>
                <button
                  onClick={() => setShowCoverEditor(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <ImageUpload
                value={plan?.coverImage}
                onChange={handleCoverChange}
                onUpload={handleCoverUpload}
                aspectRatio="16:9"
                placeholder="上传新的计划封面"
                maxSize={5}
                className="mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCoverEditor(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分享模态框 */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        plan={plan}
      />
    </div>
  );
}
