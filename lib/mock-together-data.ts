// Together功能模块的模拟数据
// 支持ToDoList + 财务跟踪器功能

// 用户背包系统
export interface UserInventory {
  userId: string;
  refreshCoupons: number; // 随机报账刷新券数量
  // 未来可扩展其他道具
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: Date;
}

export interface Binding {
  id: string;
  userA: string; // 用户A的ID
  userB: string; // 用户B的ID
  relationshipType: 'family' | 'couple' | 'friend'; // 关系类型
  status: 'pending' | 'active' | 'rejected'; // 绑定状态
  createdAt: Date;
  confirmedAt?: Date;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string; // 用户ID，可选
  createdBy: string; // 创建者用户ID
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
  tags?: string[];
}

export interface FinanceRecord {
  id: string;
  amount: number; // 金额，正数表示收入，负数表示支出
  type: 'income' | 'expense'; // 类型：收入或支出
  category: string; // 分类：如餐饮、交通、娱乐等
  description: string; // 描述
  date: Date; // 交易日期
  createdBy: string; // 记录创建者用户ID
  createdAt: Date;
  tags?: string[];
  reimbursed?: boolean; // 是否已关联报账
}

export interface ReimbursementRequest {
  id: string;
  fromUser: string;
  toUser: string;
  transactionId?: string; // 关联的交易ID
  originalAmount: number;
  
  // 报账模式和选项 (由发起者设定)
  mode: 'suggest' | 'request'; // 'suggest': 发起者建议模式, 'request': 请求对方选择模式
  suggestionType?: 'full' | 'half' | 'random' | 'custom';
  suggestedAmount?: number;
  
  // 最终结果 (由接收者决定)
  finalAmount?: number; 
  finalMode?: 'full' | 'half' | 'random' | 'custom';

  status: 'pending' | 'confirmed' | 'revealed';
  description: string;
  requestDate: Date;
  createdAt: Date;
  confirmedAt?: Date;
  revealedAt?: Date;

  // 刷新券相关
  hasUsedRefreshCoupon?: boolean; // 是否已使用过刷新券
  refreshHistory?: {
    originalAmount: number;
    refreshedAmount: number;
    refreshedAt: Date;
  }[]; // 刷新历史记录
}

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: '1282477078@qq.com',
    name: '张小明',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format',
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'user-2', 
    email: '3158079858@qq.com',
    name: '李小美',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c3d1dad9?w=100&h=100&fit=crop&crop=face&auto=format',
    createdAt: new Date('2024-01-02')
  }
];

// 模拟用户背包数据
export const mockUserInventories: UserInventory[] = [
  {
    userId: 'user-1',
    refreshCoupons: 2 // 张小明有2张刷新券
  },
  {
    userId: 'user-2',
    refreshCoupons: 1 // 李小美有1张刷新券
  }
];

// 模拟绑定关系
export const mockBindings: Binding[] = [
  {
    id: 'binding-1',
    userA: 'user-1',
    userB: 'user-2', 
    relationshipType: 'couple',
    status: 'active',
    createdAt: new Date('2024-01-03'),
    confirmedAt: new Date('2024-01-03')
  }
];

// 模拟待办事项
export const mockTodos: TodoItem[] = [
  {
    id: 'todo-1',
    title: '买菜准备晚餐',
    description: '去超市买新鲜蔬菜和肉类，准备今晚的浪漫晚餐',
    isCompleted: false,
    priority: 'high',
    assignedTo: 'user-1',
    createdBy: 'user-2',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2天后
    createdAt: new Date('2024-01-10'),
    tags: ['生活', '饮食']
  },
  {
    id: 'todo-2',
    title: '预订电影票',
    description: '预订这周末的电影票，新上映的科幻片',
    isCompleted: true,
    priority: 'medium',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-08'),
    completedAt: new Date('2024-01-09'),
    tags: ['娱乐', '约会']
  },
  {
    id: 'todo-3',
    title: '整理书房',
    description: '把书房的书籍重新分类整理，创造更好的工作环境',
    isCompleted: false,
    priority: 'low',
    createdBy: 'user-1',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
    createdAt: new Date('2024-01-05'),
    tags: ['家务', '整理']
  },
  {
    id: 'todo-4',
    title: '计划周末旅行',
    description: '选择一个适合的地方，预订酒店和交通',
    isCompleted: false,
    priority: 'medium',
    createdBy: 'user-2',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3天后
    createdAt: new Date('2024-01-11'),
    tags: ['旅行', '计划']
  },
  {
    id: 'todo-5',
    title: '购买生日礼物',
    description: '为即将到来的生日准备一份特别的礼物',
    isCompleted: true,
    priority: 'high',
    assignedTo: 'user-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-01'),
    completedAt: new Date('2024-01-07'),
    tags: ['礼物', '生日']
  }
];

// 模拟财务记录
export const mockFinanceRecords: FinanceRecord[] = [
  {
    id: 'finance-1',
    amount: -126.50,
    type: 'expense',
    category: '餐饮',
    description: '日式料理晚餐',
    date: new Date('2024-01-12'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-12'),
    tags: ['约会', '日料'],
    reimbursed: true
  },
  {
    id: 'finance-2',
    amount: -45.00,
    type: 'expense', 
    category: '交通',
    description: '打车费用',
    date: new Date('2024-01-12'),
    createdBy: 'user-2',
    createdAt: new Date('2024-01-12'),
    tags: ['出行'],
    reimbursed: true
  },
  {
    id: 'finance-3',
    amount: -89.90,
    type: 'expense',
    category: '娱乐',
    description: '电影票 + 爆米花',
    date: new Date('2024-01-10'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-10'),
    tags: ['电影', '约会'],
    reimbursed: true
  },
  {
    id: 'finance-4',
    amount: -234.00,
    type: 'expense',
    category: '购物',
    description: '超市采购生活用品',
    date: new Date('2024-01-09'),
    createdBy: 'user-2',
    createdAt: new Date('2024-01-09'),
    tags: ['生活用品', '超市'],
    reimbursed: true
  },
  {
    id: 'finance-5',
    amount: 2500.00,
    type: 'income',
    category: '工资',
    description: '1月份部分工资',
    date: new Date('2024-01-08'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-08'),
    tags: ['工资'],
    reimbursed: true
  },
  {
    id: 'finance-6',
    amount: -156.80,
    type: 'expense',
    category: '健康',
    description: '健身房月卡',
    date: new Date('2024-01-07'),
    createdBy: 'user-2',
    createdAt: new Date('2024-01-07'),
    tags: ['健身', '月卡'],
    reimbursed: true
  },
  {
    id: 'finance-7',
    amount: -78.50,
    type: 'expense',
    category: '餐饮',
    description: '咖啡厅下午茶',
    date: new Date('2024-01-06'),
    createdBy: 'user-1',
    createdAt: new Date('2024-01-06'),
    tags: ['咖啡', '下午茶'],
    reimbursed: true
  },
  {
    id: 'finance-8',
    amount: -58.00,
    type: 'expense',
    category: '教育',
    description: '购买专业书籍',
    date: new Date('2024-01-14'),
    createdBy: 'user-2',
    createdAt: new Date('2024-01-14'),
    tags: ['学习', '书籍'],
    reimbursed: true
  }
];

// 模拟报账请求
export const mockReimbursementRequests: ReimbursementRequest[] = [
  {
    id: 'reimburse-1',
    fromUser: 'user-1',
    toUser: 'user-2',
    transactionId: 'finance-1',
    originalAmount: 126.50,
    mode: 'suggest',
    suggestionType: 'random',
    suggestedAmount: 23.00, // 修正为1-45范围内的值
    finalAmount: 25.00, // 修正最终金额也在合理范围内
    status: 'confirmed',
    description: '日式料理晚餐 AA',
    requestDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-12'),
    confirmedAt: new Date('2024-01-12')
  },
  {
    id: 'reimburse-2',
    fromUser: 'user-2',
    toUser: 'user-1',
    transactionId: 'finance-3',
    originalAmount: 89.90,
    mode: 'suggest',
    suggestionType: 'full',
    status: 'pending',
    description: '电影票报账',
    requestDate: new Date('2024-01-11'),
    createdAt: new Date('2024-01-11')
  },
  {
    id: 'reimburse-3',
    fromUser: 'user-2',
    toUser: 'user-1',
    transactionId: 'finance-2',
    originalAmount: 45.00,
    mode: 'request', // 请求对方选择模式
    status: 'pending',
    description: '打车费',
    requestDate: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13')
  },
  {
    id: 'reimburse-4',
    fromUser: 'user-2',
    toUser: 'user-1',
    transactionId: 'finance-4',
    originalAmount: 234.00,
    mode: 'suggest',
    suggestionType: 'half',
    suggestedAmount: 117.00,
    status: 'pending',
    description: '上周超市采购的生活用品',
    requestDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'reimburse-5',
    fromUser: 'user-2',
    toUser: 'user-1',
    transactionId: 'finance-6',
    originalAmount: 156.80,
    mode: 'suggest',
    suggestionType: 'custom',
    suggestedAmount: 100.00,
    status: 'pending',
    description: '健身房月卡费用',
    requestDate: new Date('2024-01-16'),
    createdAt: new Date('2024-01-16')
  },
  {
    id: 'reimburse-6',
    fromUser: 'user-2',
    toUser: 'user-1',
    transactionId: 'finance-8',
    originalAmount: 58.00,
    mode: 'suggest',
    suggestionType: 'custom',
    suggestedAmount: undefined, // Let receiver decide
    status: 'pending',
    description: '帮忙买的书，你看看报多少合适',
    requestDate: new Date('2024-01-17'),
    createdAt: new Date('2024-01-17')
  }
];

// 工具函数：获取当前用户
export const getCurrentUser = (): User => mockUsers[0]; // 默认返回第一个用户

// 工具函数：获取绑定的用户
export const getBoundUser = (currentUserId: string): User | null => {
  const binding = mockBindings.find(b => 
    (b.userA === currentUserId || b.userB === currentUserId) && 
    b.status === 'active'
  );
  
  if (!binding) return null;
  
  const boundUserId = binding.userA === currentUserId ? binding.userB : binding.userA;
  return mockUsers.find(u => u.id === boundUserId) || null;
};

// 获取用户背包
export const getUserInventory = (userId: string): UserInventory | null => {
  return mockUserInventories.find(inv => inv.userId === userId) || null;
};

// 使用刷新券
export const useRefreshCoupon = (userId: string): boolean => {
  const inventory = getUserInventory(userId);
  if (!inventory || inventory.refreshCoupons <= 0) {
    return false;
  }
  inventory.refreshCoupons--;
  return true;
};

// 财务分类常量
export const FINANCE_CATEGORIES = [
  '餐饮', '交通', '娱乐', '购物', '健康', '工资', '教育', '住房', '其他'
] as const;

// 待办事项优先级选项
export const TODO_PRIORITIES = [
  { value: 'low', label: '低', color: 'text-gray-400' },
  { value: 'medium', label: '中', color: 'text-yellow-400' },
  { value: 'high', label: '高', color: 'text-red-400' }
] as const; 