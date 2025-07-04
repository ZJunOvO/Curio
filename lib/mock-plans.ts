// 计划模块模拟数据

export interface PlanMember {
  id: string;
  name: string;
  avatar: string;
  role: 'creator' | 'collaborator' | 'viewer';
  joinedAt: Date;
}

export interface PlanApproval {
  id: string;
  memberId: string;
  memberName: string;
  status: 'approved' | 'rejected' | 'pending' | 'discussion';
  comment?: string;
  createdAt: Date;
}

export interface PlanVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  createdAt: Date;
  createdBy: string;
  status: 'active' | 'archived' | 'draft';
  changes?: string[];
}

export interface PlanPath {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  progress: number;
  milestones: {
    id: string;
    title: string;
    date: Date;
    completed: boolean;
  }[];
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: 'travel' | 'career' | 'learning' | 'health' | 'finance' | 'personal' | 'project' | 'research' | 'event' | 'creative';
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  targetDate: Date;
  status: 'draft' | 'review' | 'active' | 'completed' | 'archived';
  progress: number;
  creator: PlanMember;
  members: PlanMember[];
  approvals: PlanApproval[];
  currentVersion: PlanVersion;
  versions: PlanVersion[];
  paths: PlanPath[];
  tags: string[];
  metrics: {
    totalTasks: number;
    completedTasks: number;
    totalBudget?: number;
    spentBudget?: number;
  };
  activities: PlanActivity[];
}

export interface PlanActivity {
  id: string;
  type: 'creation' | 'update' | 'completion' | 'comment' | 'status_change' | 'milestone' | 'member';
  description: string;
  timestamp: Date;
  actor: {
    name: string;
    avatar: string;
  };
  details?: Record<string, any>;
}

// 模拟成员数据
const mockMembers: PlanMember[] = [
  {
    id: '1',
    name: '张明',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'creator',
    joinedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: '李华',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: 'collaborator',
    joinedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: '王芳',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'collaborator',
    joinedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: '赵强',
    avatar: 'https://i.pravatar.cc/150?img=4',
    role: 'viewer',
    joinedAt: new Date('2024-02-15'),
  },
];

// 模拟计划数据
export const mockPlans: Plan[] = [
  {
    id: '1',
    title: '环游世界计划',
    description: '用一年时间走遍七大洲，体验不同的文化，记录美好的瞬间。从亚洲出发，经过欧洲、非洲、北美、南美、大洋洲，最后回到起点。',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    category: 'travel',
    priority: 'high',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-20'),
    startDate: new Date('2024-07-01'),
    targetDate: new Date('2025-07-01'),
    status: 'review',
    progress: 15,
    creator: mockMembers[0],
    members: [mockMembers[0], mockMembers[1], mockMembers[2]],
    approvals: [
      {
        id: '1',
        memberId: '1',
        memberName: '张明',
        status: 'approved',
        comment: '计划很完善，期待实施！',
        createdAt: new Date('2024-06-18'),
      },
      {
        id: '2',
        memberId: '2',
        memberName: '李华',
        status: 'discussion',
        comment: '建议增加东南亚的行程，那里的文化很有特色。',
        createdAt: new Date('2024-06-19'),
      },
      {
        id: '3',
        memberId: '3',
        memberName: '王芳',
        status: 'pending',
        createdAt: new Date('2024-06-20'),
      },
    ],
    currentVersion: {
      id: 'v2',
      version: '2.0',
      title: '环游世界计划 - 优化版',
      description: '根据团队反馈调整了路线和预算',
      createdAt: new Date('2024-06-15'),
      createdBy: '张明',
      status: 'active',
      changes: ['增加了东南亚站点', '调整了预算分配', '优化了时间安排'],
    },
    versions: [
      {
        id: 'v1',
        version: '1.0',
        title: '环游世界计划 - 初版',
        description: '初步规划的世界旅行路线',
        createdAt: new Date('2024-01-01'),
        createdBy: '张明',
        status: 'archived',
      },
    ],
    paths: [
      {
        id: 'p1',
        title: '亚洲之旅',
        description: '探索亚洲的文化多样性',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-09-01'),
        status: 'planning',
        progress: 30,
        milestones: [
          { id: 'm1', title: '日本东京', date: new Date('2024-07-15'), completed: false },
          { id: 'm2', title: '泰国曼谷', date: new Date('2024-08-01'), completed: false },
          { id: 'm3', title: '印度新德里', date: new Date('2024-08-20'), completed: false },
        ],
      },
      {
        id: 'p2',
        title: '欧洲之旅',
        description: '体验欧洲的历史与艺术',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-01'),
        status: 'planning',
        progress: 0,
        milestones: [
          { id: 'm4', title: '法国巴黎', date: new Date('2024-09-15'), completed: false },
          { id: 'm5', title: '意大利罗马', date: new Date('2024-10-01'), completed: false },
          { id: 'm6', title: '西班牙巴塞罗那', date: new Date('2024-10-20'), completed: false },
        ],
      },
    ],
    tags: ['旅行', '探索', '文化', '摄影'],
    metrics: {
      totalTasks: 50,
      completedTasks: 8,
      totalBudget: 500000,
      spentBudget: 50000,
    },
    activities: [
      {
        id: 'act-1',
        type: 'creation',
        description: '创建了计划',
        timestamp: new Date('2024-01-01'),
        actor: { name: '张明', avatar: 'https://i.pravatar.cc/150?img=1' }
      },
      {
        id: 'act-2',
        type: 'comment',
        description: '建议增加东南亚的行程，那里的文化很有特色。',
        timestamp: new Date('2024-06-19'),
        actor: { name: '李华', avatar: 'https://i.pravatar.cc/150?img=2' }
      }
    ]
  },
  {
    id: '2',
    title: '全栈开发学习计划',
    description: '系统学习前端和后端技术，成为一名优秀的全栈工程师。包括React、Node.js、数据库、云服务等技术栈。',
    coverImage: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800',
    category: 'learning',
    priority: 'high',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-22'),
    startDate: new Date('2024-03-01'),
    targetDate: new Date('2024-12-31'),
    status: 'active',
    progress: 45,
    creator: mockMembers[1],
    members: [mockMembers[1], mockMembers[3]],
    approvals: [
      {
        id: '4',
        memberId: '2',
        memberName: '李华',
        status: 'approved',
        createdAt: new Date('2024-02-28'),
      },
      {
        id: '5',
        memberId: '4',
        memberName: '赵强',
        status: 'approved',
        comment: '学习路径很清晰，加油！',
        createdAt: new Date('2024-02-28'),
      },
    ],
    currentVersion: {
      id: 'v1',
      version: '1.0',
      title: '全栈开发学习计划',
      description: '完整的学习路径规划',
      createdAt: new Date('2024-02-01'),
      createdBy: '李华',
      status: 'active',
    },
    versions: [],
    paths: [
      {
        id: 'p3',
        title: '前端基础',
        description: 'HTML、CSS、JavaScript基础',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-01'),
        status: 'completed',
        progress: 100,
        milestones: [
          { id: 'm7', title: '完成HTML/CSS', date: new Date('2024-03-20'), completed: true },
          { id: 'm8', title: '掌握JavaScript', date: new Date('2024-04-15'), completed: true },
        ],
      },
      {
        id: 'p4',
        title: 'React深入',
        description: '深入学习React生态系统',
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-07-01'),
        status: 'in_progress',
        progress: 60,
        milestones: [
          { id: 'm9', title: 'React基础', date: new Date('2024-05-20'), completed: true },
          { id: 'm10', title: 'Redux状态管理', date: new Date('2024-06-10'), completed: true },
          { id: 'm11', title: 'Next.js框架', date: new Date('2024-06-30'), completed: false },
        ],
      },
    ],
    tags: ['编程', '学习', '职业发展'],
    metrics: {
      totalTasks: 120,
      completedTasks: 54,
    },
    activities: [
       {
        id: 'act-3',
        type: 'creation',
        description: '创建了计划',
        timestamp: new Date('2024-02-01'),
        actor: { name: '李华', avatar: 'https://i.pravatar.cc/150?img=2' }
      },
      {
        id: 'act-4',
        type: 'milestone',
        description: '完成了里程碑 "Redux状态管理"',
        timestamp: new Date('2024-06-10'),
        actor: { name: '李华', avatar: 'https://i.pravatar.cc/150?img=2' }
      }
    ]
  },
  {
    id: '3',
    title: '健康生活改造计划',
    description: '通过运动、饮食和作息调整，建立健康的生活方式。目标是减重10公斤，提升体能，改善睡眠质量。',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    category: 'health',
    priority: 'medium',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-06-23'),
    startDate: new Date('2024-04-15'),
    targetDate: new Date('2024-10-15'),
    status: 'active',
    progress: 35,
    creator: mockMembers[2],
    members: [mockMembers[2]],
    approvals: [
      {
        id: '6',
        memberId: '3',
        memberName: '王芳',
        status: 'approved',
        createdAt: new Date('2024-04-10'),
      },
    ],
    currentVersion: {
      id: 'v1',
      version: '1.0',
      title: '健康生活改造计划',
      description: '综合性的健康提升方案',
      createdAt: new Date('2024-04-01'),
      createdBy: '王芳',
      status: 'active',
    },
    versions: [],
    paths: [
      {
        id: 'p5',
        title: '运动计划',
        description: '每周5次运动，包括有氧和力量训练',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-10-15'),
        status: 'in_progress',
        progress: 40,
        milestones: [
          { id: 'm12', title: '建立运动习惯', date: new Date('2024-05-15'), completed: true },
          { id: 'm13', title: '完成5公里跑', date: new Date('2024-07-15'), completed: false },
          { id: 'm14', title: '达到目标体重', date: new Date('2024-10-01'), completed: false },
        ],
      },
    ],
    tags: ['健康', '运动', '生活方式'],
    metrics: {
      totalTasks: 60,
      completedTasks: 21,
    },
    activities: []
  },
  {
    id: '4',
    title: '创业项目启动计划',
    description: '启动一个在线教育平台，专注于提供高质量的编程课程。从MVP开发到市场推广的完整计划。',
    coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    category: 'career',
    priority: 'high',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-06-24'),
    startDate: new Date('2024-07-01'),
    targetDate: new Date('2025-01-01'),
    status: 'draft',
    progress: 10,
    creator: mockMembers[0],
    members: [mockMembers[0], mockMembers[1], mockMembers[2], mockMembers[3]],
    approvals: [
      {
        id: '7',
        memberId: '1',
        memberName: '张明',
        status: 'approved',
        createdAt: new Date('2024-06-20'),
      },
      {
        id: '8',
        memberId: '2',
        memberName: '李华',
        status: 'pending',
        createdAt: new Date('2024-06-24'),
      },
      {
        id: '9',
        memberId: '3',
        memberName: '王芳',
        status: 'pending',
        createdAt: new Date('2024-06-24'),
      },
      {
        id: '10',
        memberId: '4',
        memberName: '赵强',
        status: 'pending',
        createdAt: new Date('2024-06-24'),
      },
    ],
    currentVersion: {
      id: 'v3',
      version: '3.0',
      title: '创业项目启动计划 - 最终版',
      description: '整合团队意见后的最终方案',
      createdAt: new Date('2024-06-20'),
      createdBy: '张明',
      status: 'active',
      changes: ['调整了技术架构', '细化了市场策略', '增加了风险评估'],
    },
    versions: [
      {
        id: 'v1',
        version: '1.0',
        title: '创业项目启动计划 - 初稿',
        description: '初步的项目构想',
        createdAt: new Date('2024-05-01'),
        createdBy: '张明',
        status: 'archived',
      },
      {
        id: 'v2',
        version: '2.0',
        title: '创业项目启动计划 - 修订版',
        description: '加入了详细的技术方案',
        createdAt: new Date('2024-05-20'),
        createdBy: '张明',
        status: 'archived',
      },
    ],
    paths: [
      {
        id: 'p6',
        title: 'MVP开发',
        description: '最小可行产品开发',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-09-01'),
        status: 'planning',
        progress: 0,
        milestones: [
          { id: 'm15', title: '需求分析完成', date: new Date('2024-07-15'), completed: false },
          { id: 'm16', title: '原型设计完成', date: new Date('2024-08-01'), completed: false },
          { id: 'm17', title: 'MVP上线', date: new Date('2024-09-01'), completed: false },
        ],
      },
      {
        id: 'p7',
        title: '市场推广',
        description: '产品推广和用户获取',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-01'),
        status: 'planning',
        progress: 0,
        milestones: [
          { id: 'm18', title: '内测用户招募', date: new Date('2024-09-15'), completed: false },
          { id: 'm19', title: '正式发布', date: new Date('2024-10-01'), completed: false },
          { id: 'm20', title: '达到1000用户', date: new Date('2024-12-01'), completed: false },
        ],
      },
    ],
    tags: ['创业', '教育', '技术', '商业'],
    metrics: {
      totalTasks: 80,
      completedTasks: 8,
      totalBudget: 1000000,
      spentBudget: 50000,
    },
    activities: []
  },
  {
    id: '5',
    title: '家庭理财规划',
    description: '制定5年的家庭理财计划，包括储蓄、投资、保险等方面，实现财务自由的目标。',
    coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
    category: 'finance',
    priority: 'medium',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-22'),
    startDate: new Date('2024-04-01'),
    targetDate: new Date('2029-04-01'),
    status: 'active',
    progress: 20,
    creator: mockMembers[3],
    members: [mockMembers[3]],
    approvals: [
      {
        id: '11',
        memberId: '4',
        memberName: '赵强',
        status: 'approved',
        createdAt: new Date('2024-03-28'),
      },
    ],
    currentVersion: {
      id: 'v1',
      version: '1.0',
      title: '家庭理财规划',
      description: '长期财务规划方案',
      createdAt: new Date('2024-03-01'),
      createdBy: '赵强',
      status: 'active',
    },
    versions: [],
    paths: [
      {
        id: 'p8',
        title: '应急基金建立',
        description: '建立6个月生活费的应急基金',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-10-01'),
        status: 'in_progress',
        progress: 60,
        milestones: [
          { id: 'm21', title: '3个月生活费', date: new Date('2024-07-01'), completed: true },
          { id: 'm22', title: '6个月生活费', date: new Date('2024-10-01'), completed: false },
        ],
      },
    ],
    tags: ['理财', '投资', '储蓄'],
    metrics: {
      totalTasks: 40,
      completedTasks: 8,
      totalBudget: 2000000,
      spentBudget: 400000,
    },
    activities: []
  },
  {
    id: '6',
    title: '个人博客搭建',
    description: '使用 Next.js 和 Tailwind CSS 搭建一个个人技术博客，记录学习和分享经验。',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    category: 'creative',
    priority: 'low',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-25'),
    startDate: new Date('2024-06-10'),
    targetDate: new Date('2024-09-10'),
    status: 'draft',
    progress: 5,
    creator: mockMembers[1],
    members: [mockMembers[1]],
    approvals: [],
    currentVersion: {
      id: 'v1',
      version: '1.0',
      title: '个人博客搭建',
      description: '初步的技术选型和内容规划',
      createdAt: new Date('2024-06-01'),
      createdBy: '李华',
      status: 'active',
    },
    versions: [],
    paths: [
      {
        id: 'p10',
        title: '基础框架搭建',
        description: 'Next.js 项目初始化和基本布局',
        startDate: new Date('2024-06-10'),
        endDate: new Date('2024-07-01'),
        status: 'planning',
        progress: 0,
        milestones: [
          { id: 'm26', title: '完成项目初始化', date: new Date('2024-06-15'), completed: false },
          { id: 'm27', title: '设计博客布局', date: new Date('2024-06-25'), completed: false },
        ],
      },
    ],
    tags: ['Next.js', '博客', '前端开发'],
    metrics: {
      totalTasks: 10,
      completedTasks: 1,
    },
    activities: []
  }
];
