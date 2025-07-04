'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, Users, Target, TrendingUp,
  CheckCircle, XCircle, MessageCircle, AlertCircle,
  GitBranch, History, UserPlus, MoreVertical,
  Eye, Edit, Trash, ChevronRight, Sparkles,
  Shield, Crown, Zap, Plus, Trash2, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlanStore } from '@/lib/stores/usePlanStore';
import { type Plan, type PlanApproval, type PlanVersion, type PlanPath, type PlanActivity } from '@/lib/mock-plans';
import { toast } from '@/lib/stores/useToastStore';
import { PlanStatsDashboard } from '@/components/core/charts';

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
    onUpdate({
      ...plan,
      approvals: [...plan.approvals, newApproval],
      activities: [...plan.activities, activity],
      updatedAt: new Date(),
    });

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
        {plan.approvals.map((approval, index) => {
          const member = plan.members.find(m => m.id === approval.memberId);
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
const MembersSection: React.FC<{ plan: Plan, onUpdate: (updatedPlan: Plan) => void }> = ({ plan, onUpdate }) => {
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
      onUpdate({
        ...plan,
        activities: [...plan.activities, activity]
      });
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
          团队成员 ({plan.members.length})
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
        {plan.members.map((member, index) => (
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

  const handleToggleComplete = () => {
    const newStatus = !milestone.completed;
    onUpdate({ completed: newStatus });
    toast.info(
      '状态更新',
      `里程碑 "${milestone.title}" 已标记为${newStatus ? '完成' : '未完成'}。`
    );
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
  onSave: (title: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle('');
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
          <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300" aria-label="保存新里程碑">
            <CheckCircle className="w-4 h-4" />
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
  onSave: (title: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
      setTitle('');
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
          <button onClick={handleSave} className="p-1 text-green-400 hover:text-green-300" aria-label="保存新路径">
            <CheckCircle className="w-4 h-4" />
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
  plan: Plan;
  onUpdate: (updatedPlan: Plan) => void;
}> = ({ plan, onUpdate }) => {
  const [editingPathId, setEditingPathId] = useState<string | null>(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [newMilestonePathId, setNewMilestonePathId] = useState<string | null>(null);
  const [isAddingPath, setIsAddingPath] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Helper to recalculate plan status ---
  const recalculatePlanStatus = (paths: PlanPath[]): { status: Plan['status'], progress: number } => {
    // 改进：基于所有里程碑的完成情况来计算进度，而不仅仅是路径状态
    const totalMilestones = paths.reduce((total, path) => total + path.milestones.length, 0);
    
    if (totalMilestones === 0) {
      return { status: plan.status, progress: 0 };
    }
    
    const completedMilestones = paths.reduce((total, path) => 
      total + path.milestones.filter(m => m.completed).length, 0
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
    
    return { status, progress };
  };

  // --- Path Logic ---
  const addPath = (title: string) => {
    const newPath: PlanPath = {
      id: generateId(),
      title,
      description: '请填写路径描述',
      startDate: plan.startDate,
      endDate: plan.targetDate,
      status: 'planning',
      progress: 0,
      milestones: [],
    };
    
    const activity = createActivity('update', `添加了新的执行路径: "${title}"`);
    onUpdate({
      ...plan,
      paths: [...plan.paths, newPath],
      activities: [...plan.activities, activity]
    });
    setIsAddingPath(false);
  };

  const updatePath = (pathId: string, updates: { title?: string; description?: string }) => {
    const updatedPaths = plan.paths.map(p => p.id === pathId ? { ...p, ...updates } : p);

    const activity = createActivity('update', `更新了路径 "${updatedPaths.find(p=>p.id === pathId)?.title}" 的信息.`);
    onUpdate({
      ...plan,
      paths: updatedPaths,
      activities: [...plan.activities, activity],
      updatedAt: new Date(),
     });
    toast.success('执行路径已更新', '路径信息已成功保存。');
  };

  const deletePath = (pathId: string) => {
    const pathToDelete = plan.paths.find(p => p.id === pathId);
    if (!pathToDelete) return;

    const updatedPaths = plan.paths.filter(p => p.id !== pathId);
    const { status: newPlanStatus, progress: newPlanProgress } = recalculatePlanStatus(updatedPaths);

    const activity = createActivity('update', `删除了执行路径: "${pathToDelete.title}"`);

    onUpdate({
      ...plan,
      paths: updatedPaths,
      status: newPlanStatus,
      progress: newPlanProgress,
      activities: [...plan.activities, activity],
      updatedAt: new Date(),
    });

    toast.warning('执行路径已删除', `路径 "${pathToDelete.title}" 已被删除。`);
  };

  const handleUpdatePath = (pathId: string, updates: { title?: string; description?: string }) => {
    updatePath(pathId, updates);
  };

  // --- Milestone Logic ---
  const handleAddNewMilestone = (pathId: string) => {
    setNewMilestonePathId(pathId);
  };
  
  const saveNewMilestone = (pathId: string, title: string) => {
    const newMilestone = {
      id: generateId(),
      title,
      date: new Date(),
      completed: false,
    };
    const updatedPaths = plan.paths.map(p =>
      p.id === pathId
        ? { ...p, milestones: [...p.milestones, newMilestone] }
        : p
    );
    onUpdate({ ...plan, paths: updatedPaths });
    toast.success('里程碑已添加', `新的里程碑 "${title}" 已成功添加。`);
    setNewMilestonePathId(null);
  };

  const cancelAddNewMilestone = () => {
    setNewMilestonePathId(null);
  };

  const updateMilestone = (pathId: string, milestoneId: string, updates: Partial<any>) => {
    let milestoneTitle = '';
    let milestoneCompleted: boolean | undefined;
    let newActivities: PlanActivity[] = [];

    const updatedPaths = plan.paths.map(path => {
      if (path.id === pathId) {
        const originalPath = { ...path };
        const updatedMilestones = path.milestones.map(m => {
          if (m.id === milestoneId) {
            milestoneTitle = m.title;
            if (updates.completed !== undefined && m.completed !== updates.completed) {
              milestoneCompleted = updates.completed;
            }
            return { ...m, ...updates };
          }
          return m;
        });

        // Check if all milestones in this path are completed
        const allMilestonesCompleted = updatedMilestones.every(m => m.completed);
        const newPathStatus: PlanPath['status'] = allMilestonesCompleted ? 'completed' : 'in_progress';
        
        if (originalPath.status !== newPathStatus) {
           newActivities.push(createActivity('status_change', `路径 "${originalPath.title}" 的状态更新为: ${newPathStatus === 'completed' ? '已完成' : '进行中'}`));
        }
        
        const completedCount = updatedMilestones.filter(m => m.completed).length;
        const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

        return { ...path, milestones: updatedMilestones, status: newPathStatus, progress: progress };
      }
      return path;
    });

    if (milestoneCompleted !== undefined) {
      newActivities.push(createActivity('milestone', `里程碑 "${milestoneTitle}" 标记为${milestoneCompleted ? '完成' : '未完成'}`));
    }

    const { status: newPlanStatus, progress: newPlanProgress } = recalculatePlanStatus(updatedPaths);
    
    if (plan.status !== newPlanStatus) {
        newActivities.push(createActivity('status_change', `计划状态更新为: ${newPlanStatus === 'completed' ? '已完成' : '进行中'}`));
    }

    onUpdate({
      ...plan,
      paths: updatedPaths,
      status: newPlanStatus,
      progress: newPlanProgress,
      activities: [...plan.activities, ...newActivities],
      updatedAt: new Date(), // Update timestamp
    });
  };

  const deleteMilestone = (pathId: string, milestoneId: string) => {
    const path = plan.paths.find(p => p.id === pathId);
    if (!path) return;
    const milestone = path.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;

    let updatedPaths = plan.paths.map(p => 
      p.id === pathId 
        ? { ...p, milestones: p.milestones.filter(m => m.id !== milestoneId) } 
        : p
    );
    
    // After deleting a milestone, we must also recalculate the status and progress of the affected path
    updatedPaths = updatedPaths.map(currentPath => {
      if (currentPath.id === pathId) {
        const completedCount = currentPath.milestones.filter(m => m.completed).length;
        const progress = currentPath.milestones.length > 0 ? Math.round((completedCount / currentPath.milestones.length) * 100) : 0;
        
        let newPathStatus: PlanPath['status'] = 'planning';
        if (currentPath.milestones.length > 0) {
          if (progress === 100) {
            newPathStatus = 'completed';
          } else if (progress > 0) {
            newPathStatus = 'in_progress';
          }
        }
        
        return { ...currentPath, status: newPathStatus, progress: progress };
      }
      return currentPath;
    });

    const { status: newPlanStatus, progress: newPlanProgress } = recalculatePlanStatus(updatedPaths);

    const activity = createActivity('milestone', `删除了里程碑: "${milestone.title}"`);

    onUpdate({
      ...plan,
      paths: updatedPaths,
      status: newPlanStatus,
      progress: newPlanProgress,
      activities: [...plan.activities, activity],
      updatedAt: new Date(),
    });

    toast.warning('里程碑已删除', `里程碑 "${milestone.title}" 已被删除。`);
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
        {plan.paths.map((path, index) => {
          // --- DYNAMIC PROGRESS CALCULATION ---
          const completedMilestones = path.milestones.filter(m => m.completed).length;
          const totalMilestones = path.milestones.length;
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

                {path.milestones.map(milestone => (
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
        {[...plan.activities].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((activity, index) => (
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
  const { getPlanById, updatePlan, initializePlans } = usePlanStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'versions' | 'members' | 'approvals' | 'activity' | 'stats'>('overview');
  const [localPlan, setLocalPlan] = useState<Plan | null>(null);

  useEffect(() => {
    // 确保数据已初始化
    initializePlans();
    
    const planId = params.id as string;
    const foundPlan = getPlanById(planId);
    setPlan(foundPlan || null);
    setLocalPlan(foundPlan || null); // 初始化localPlan
  }, [params.id, getPlanById, initializePlans]);

  if (!plan || !localPlan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  const handlePlanUpdate = (updatedPlan: Plan) => {
    // 立即更新本地状态
    setLocalPlan(updatedPlan);
    setPlan(updatedPlan);
    
    // 立即更新全局状态（这会触发localStorage持久化）
    updatePlan(updatedPlan.id, updatedPlan);
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

        {/* 返回按钮 */}
        <div className="absolute top-6 left-6 z-20">
          <a
            href="/plans"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </a>
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
                      plan.paths.forEach(path => {
                        path.milestones.forEach(milestone => {
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
                      plan.paths.forEach(path => {
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
                      const hasActivities = plan.paths.some(path => 
                        path.milestones.some(m => m.completed) || 
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
                </div>

                {/* 标签 */}
                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
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
              <PathsSection plan={localPlan} onUpdate={handlePlanUpdate} />
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
              <VersionView plan={localPlan} />
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
              <MembersSection plan={localPlan} onUpdate={handlePlanUpdate} />
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
              <ApprovalSection plan={localPlan} onUpdate={handlePlanUpdate} />
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
              <ActivitySection plan={localPlan} />
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
              <PlanStatsDashboard plans={[localPlan]} className="max-w-none" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
