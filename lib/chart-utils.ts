import { Plan } from './mock-plans';

// 颜色主题 - 遵循Apple Design原则
export const chartColors = {
  primary: '#007AFF',      // Apple Blue
  success: '#34C759',      // Apple Green  
  warning: '#FF9500',      // Apple Orange
  error: '#FF3B30',        // Apple Red
  purple: '#AF52DE',       // Apple Purple
  teal: '#5AC8FA',         // Apple Teal
  indigo: '#5856D6',       // Apple Indigo
  pink: '#FF2D92',         // Apple Pink
  gray: '#8E8E93',         // Apple Gray
  dark: '#1C1C1E',         // Apple Dark
};

// 计划状态分布数据
export interface StatusDistributionData {
  name: string;
  value: number;
  color: string;
  description: string;
}

export const getPlanStatusDistribution = (plans: Plan[]): StatusDistributionData[] => {
  const statusMap = new Map<string, number>();
  
  plans.forEach(plan => {
    const count = statusMap.get(plan.status) || 0;
    statusMap.set(plan.status, count + 1);
  });

  const statusConfig = {
    draft: { name: '草稿', color: chartColors.gray, description: '待完善的计划' },
    review: { name: '审核中', color: chartColors.warning, description: '等待团队审批' },
    active: { name: '进行中', color: chartColors.primary, description: '正在执行的计划' },
    completed: { name: '已完成', color: chartColors.success, description: '成功完成的计划' },
    archived: { name: '已归档', color: chartColors.dark, description: '归档的计划' }
  };

  return Array.from(statusMap.entries()).map(([status, count]) => ({
    name: statusConfig[status as keyof typeof statusConfig]?.name || status,
    value: count,
    color: statusConfig[status as keyof typeof statusConfig]?.color || chartColors.gray,
    description: statusConfig[status as keyof typeof statusConfig]?.description || ''
  }));
};

// 计划分类分布数据
export interface CategoryDistributionData {
  category: string;
  count: number;
  color: string;
  name: string;
}

export const getPlanCategoryDistribution = (plans: Plan[]): CategoryDistributionData[] => {
  const categoryMap = new Map<string, number>();
  
  plans.forEach(plan => {
    const count = categoryMap.get(plan.category) || 0;
    categoryMap.set(plan.category, count + 1);
  });

  const categoryConfig = {
    travel: { name: '旅行规划', color: chartColors.teal },
    career: { name: '职业发展', color: chartColors.primary },
    learning: { name: '学习成长', color: chartColors.purple },
    health: { name: '健康生活', color: chartColors.success },
    finance: { name: '财务规划', color: chartColors.warning },
    personal: { name: '个人项目', color: chartColors.pink },
    project: { name: '项目管理', color: chartColors.indigo },
    research: { name: '研究调查', color: chartColors.error },
    event: { name: '活动策划', color: chartColors.dark },
    creative: { name: '创意设计', color: '#FF6B35' }
  };

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    color: categoryConfig[category as keyof typeof categoryConfig]?.color || chartColors.gray,
    name: categoryConfig[category as keyof typeof categoryConfig]?.name || category
  }));
};

// 计划优先级分布数据
export interface PriorityDistributionData {
  priority: string;
  count: number;
  color: string;
  name: string;
}

export const getPlanPriorityDistribution = (plans: Plan[]): PriorityDistributionData[] => {
  const priorityMap = new Map<string, number>();
  
  plans.forEach(plan => {
    const count = priorityMap.get(plan.priority) || 0;
    priorityMap.set(plan.priority, count + 1);
  });

  const priorityConfig = {
    high: { name: '高优先级', color: chartColors.error },
    medium: { name: '中优先级', color: chartColors.warning },
    low: { name: '低优先级', color: chartColors.success }
  };

  return Array.from(priorityMap.entries()).map(([priority, count]) => ({
    priority,
    count,
    color: priorityConfig[priority as keyof typeof priorityConfig]?.color || chartColors.gray,
    name: priorityConfig[priority as keyof typeof priorityConfig]?.name || priority
  }));
};

// 计划进度统计数据
export interface ProgressData {
  name: string;
  progress: number;
  status: string;
  color: string;
}

export const getPlanProgressData = (plans: Plan[]): ProgressData[] => {
  return plans.map(plan => ({
    name: plan.title.length > 15 ? plan.title.substring(0, 15) + '...' : plan.title,
    progress: plan.progress,
    status: plan.status,
    color: plan.status === 'completed' ? chartColors.success : 
           plan.status === 'active' ? chartColors.primary :
           plan.status === 'review' ? chartColors.warning : chartColors.gray
  }));
};

// 预算使用情况数据
export interface BudgetData {
  name: string;
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  utilizationRate: number;
}

export const getBudgetData = (plans: Plan[]): BudgetData[] => {
  return plans
    .filter(plan => plan.metrics.totalBudget && plan.metrics.totalBudget > 0)
    .map(plan => {
      const total = plan.metrics.totalBudget || 0;
      const spent = plan.metrics.spentBudget || 0;
      const remaining = total - spent;
      const utilizationRate = total > 0 ? Math.round((spent / total) * 100) : 0;
      
      return {
        name: plan.title.length > 12 ? plan.title.substring(0, 12) + '...' : plan.title,
        totalBudget: total,
        spentBudget: spent,
        remainingBudget: remaining,
        utilizationRate
      };
    });
};

// 任务完成情况数据
export interface TaskData {
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  completionRate: number;
}

export const getOverallTaskData = (plans: Plan[]): TaskData => {
  const totalTasks = plans.reduce((sum, plan) => sum + plan.metrics.totalTasks, 0);
  const completedTasks = plans.reduce((sum, plan) => sum + plan.metrics.completedTasks, 0);
  const remainingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return {
    totalTasks,
    completedTasks,
    remainingTasks,
    completionRate
  };
};

// 月度计划创建趋势数据
export interface MonthlyTrendData {
  month: string;
  count: number;
  color: string;
}

export const getMonthlyCreationTrend = (plans: Plan[]): MonthlyTrendData[] => {
  const monthMap = new Map<string, number>();
  
  plans.forEach(plan => {
    const month = plan.createdAt.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
    const count = monthMap.get(month) || 0;
    monthMap.set(month, count + 1);
  });
  
  // 排序并转换数据
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      month,
      count,
      color: chartColors.primary
    }));
};

// 团队成员参与度数据
export interface MemberParticipationData {
  memberName: string;
  planCount: number;
  roles: string[];
  color: string;
}

export const getMemberParticipation = (plans: Plan[]): MemberParticipationData[] => {
  const memberMap = new Map<string, { count: number; roles: Set<string> }>();
  
  plans.forEach(plan => {
    plan.members.forEach(member => {
      const existing = memberMap.get(member.name) || { count: 0, roles: new Set() };
      existing.count += 1;
      existing.roles.add(member.role);
      memberMap.set(member.name, existing);
    });
  });
  
  const colors = [chartColors.primary, chartColors.success, chartColors.warning, chartColors.purple, chartColors.teal];
  
  return Array.from(memberMap.entries()).map(([name, data], index) => ({
    memberName: name,
    planCount: data.count,
    roles: Array.from(data.roles),
    color: colors[index % colors.length]
  }));
};

// 计划健康度评分（基于进度、时间等因素）
export interface PlanHealthData {
  name: string;
  healthScore: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  factors: {
    progress: number;
    timeRemaining: number;
    taskCompletion: number;
  };
}

export const getPlanHealthData = (plans: Plan[]): PlanHealthData[] => {
  return plans.map(plan => {
    const now = new Date();
    const totalDuration = plan.targetDate.getTime() - plan.startDate.getTime();
    const elapsed = now.getTime() - plan.startDate.getTime();
    const timeProgress = totalDuration > 0 ? Math.min(Math.max(elapsed / totalDuration, 0), 1) : 0;
    
    const taskCompletion = plan.metrics.totalTasks > 0 ? 
      plan.metrics.completedTasks / plan.metrics.totalTasks : 0;
    
    const progressScore = plan.progress;
    const timeScore = Math.max(0, 100 - Math.abs((timeProgress * 100) - progressScore));
    const taskScore = taskCompletion * 100;
    
    const healthScore = Math.round((progressScore + timeScore + taskScore) / 3);
    
    let status: 'excellent' | 'good' | 'warning' | 'critical';
    if (healthScore >= 80) status = 'excellent';
    else if (healthScore >= 60) status = 'good';
    else if (healthScore >= 40) status = 'warning';
    else status = 'critical';
    
    return {
      name: plan.title.length > 12 ? plan.title.substring(0, 12) + '...' : plan.title,
      healthScore,
      status,
      factors: {
        progress: progressScore,
        timeRemaining: Math.round(timeScore),
        taskCompletion: Math.round(taskScore)
      }
    };
  });
}; 