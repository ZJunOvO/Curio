'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Plus, Search, Clock, Zap, LayoutGrid, GitBranch, Trello, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserPlans, testDatabaseConnection, type Plan } from '@/lib/supabase/database';
import { toast } from '@/lib/stores/useToastStore';
import { PlanListSkeleton } from '@/components/ui/Skeleton';

const getPriorityIcon = (priority: string) => {
  if (priority === 'high') return <Zap className="w-4 h-4 text-red-400" />;
  if (priority === 'medium') return <Clock className="w-4 h-4 text-yellow-400" />;
  return null;
};

const getDueDateStatus = (targetDate: string) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return <span className="text-red-400">已过期</span>;
  }
  if (diffDays <= 7) {
    return <span className="text-yellow-400">{`还有 ${diffDays} 天`}</span>;
  }
  return <span className="text-gray-400">{`还有 ${diffDays} 天`}</span>;
};

export default function PlansPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down' | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    const previousScrollY = lastScrollY.current;
    
    if (currentScrollY > previousScrollY) {
      scrollDirection.current = 'down';
    } else if (currentScrollY < previousScrollY) {
      scrollDirection.current = 'up';
    }
    
    const SHOW_THRESHOLD = 60;
    const HIDE_THRESHOLD = 200;
    
    if (currentScrollY < SHOW_THRESHOLD && scrollDirection.current === 'up' && !isHeaderVisible) {
      setIsHeaderVisible(true);
    } else if (currentScrollY > HIDE_THRESHOLD && scrollDirection.current === 'down' && isHeaderVisible) {
      setIsHeaderVisible(false);
    }
    
    lastScrollY.current = currentScrollY;
  });

  // 加载计划数据
  useEffect(() => {
    if (user) {
      loadPlans();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadPlans = async () => {
    if (!user) {
      console.log('❌ 用户未登录，无法加载计划');
      return;
    }
    
    console.log('🔄 开始加载计划数据, 用户ID:', user.id);
    
    // 首先测试数据库连接
    const testResult = await testDatabaseConnection();
    console.log('🔍 数据库测试结果:', testResult);
    
    try {
      setLoading(true);
      const userPlans = await getUserPlans(user.id);
      console.log('✅ 计划加载成功:', userPlans?.length || 0, '个计划');
      setPlans(userPlans || []);
      
      if (!userPlans || userPlans.length === 0) {
        console.log('💭 没有找到计划数据，但无错误（正常情况）');
      }
    } catch (error) {
      console.error('❌ 加载计划失败:', error);
      console.error('❌ 错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error('加载失败', `无法加载计划数据: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = useMemo(() => {
    return plans
      .filter(plan => filterStatus === 'all' || plan.status === filterStatus)
      .filter(plan => plan.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [plans, filterStatus, searchQuery]);

  const kanbanGroups = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      draft: [],
      review: [],
      active: [],
      completed: [],
    };
    filteredPlans.forEach(plan => {
      if (groups[plan.status]) {
        groups[plan.status].push(plan);
      }
    });
    return groups;
  }, [filteredPlans]);

  // 如果未认证，显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center">
            <LayoutGrid size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">计划管理</h1>
          <p className="text-gray-400 mb-8 text-lg">
            登录后管理你的梦想蓝图
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              <LogIn size={20} />
              登录账户
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold transition-all duration-300 backdrop-blur-2xl border border-white/20"
            >
              创建新账户
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // 加载状态
  if (loading || authLoading) {
    return <PlanListSkeleton />;
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <AnimatePresence>
            {isHeaderVisible && (
              <motion.div
                initial={{ height: 'auto', opacity: 1, marginBottom: '1rem' }}
                animate={{ height: 'auto', opacity: 1, marginBottom: '1rem' }}
                exit={{ height: 0, opacity: 0, marginBottom: '0rem' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <h1 className="text-2xl font-bold">我的计划</h1>
                <p className="text-sm text-gray-400 mt-1">管理你的梦想蓝图</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索计划..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="flex items-center bg-white/5 rounded-lg p-1 flex-shrink-0">
              {[
                { mode: 'grid', icon: LayoutGrid, label: '网格' },
                { mode: 'timeline', icon: GitBranch, label: '时间轴' },
                { mode: 'kanban', icon: Trello, label: '看板' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={cn(
                    'p-1.5 sm:px-3 sm:py-1.5 rounded-md text-sm transition-all flex items-center gap-1.5',
                    viewMode === mode ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
                  )}
                  aria-label={`切换到${label}视图`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <a 
              href="/plans/create"
              className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">新建</span>
            </a>
          </div>

          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4">
            {['all', 'draft', 'review', 'active', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-all duration-300 flex-shrink-0",
                  filterStatus === status ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {status === 'all' ? '全部' : 
                 status === 'draft' ? '草稿' :
                 status === 'review' ? '审核中' :
                 status === 'active' ? '进行中' : '已完成'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {filteredPlans.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md">
              <LayoutGrid size={80} className="mx-auto mb-6 text-white/30" />
              <h3 className="text-2xl font-bold text-white mb-4">
                {filterStatus === 'all' ? '还没有计划' : `还没有${filterStatus === 'draft' ? '草稿' : filterStatus === 'review' ? '审核中' : filterStatus === 'active' ? '进行中' : '已完成'}的计划`}
              </h3>
              <p className="text-gray-400 mb-8">
                创建你的第一个计划，开始管理梦想蓝图
              </p>
              <a
                href="/plans/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all"
              >
                <Plus size={20} />
                创建计划
              </a>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredPlans.map((plan, index) => (
                  <PlanCard key={plan.id} plan={plan} index={index} viewMode="grid" />
                ))}
              </motion.div>
            )}

            {viewMode === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative px-4 sm:px-0"
              >
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                
                <div className="space-y-12">
                  {filteredPlans.map((plan, index) => (
                    <PlanCard key={plan.id} plan={plan} index={index} viewMode="timeline" />
                  ))}
                </div>
              </motion.div>
            )}
            
            {viewMode === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible -mx-6 px-6"
              >
                {Object.entries(kanbanGroups).map(([status, groupPlans]) => (
                  <div key={status} className="min-w-[18rem] space-y-4 md:min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold capitalize">
                        {status === 'draft' ? '草稿' : 
                         status === 'review' ? '审核中' :
                         status === 'active' ? '进行中' : '已完成'}
                      </h3>
                      <span className="text-sm text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">{groupPlans.length}</span>
                    </div>
                    <div className="space-y-4">
                      {groupPlans.map((plan, index) => (
                        <PlanCard key={plan.id} plan={plan} index={index} viewMode="kanban" />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}

const PlanCard: React.FC<{ plan: any; index: number; viewMode: 'grid' | 'timeline' | 'kanban' }> = ({ plan, index, viewMode }) => {
  const router = useRouter();
  const [showDescription, setShowDescription] = useState(false);

  if (viewMode === 'timeline') {
    const isEven = index % 2 === 0;
    return (
      <div className={cn("flex items-center", isEven ? "flex-row-reverse" : "flex-row")}>
        <div className="flex-1" />
        <div className="relative w-12 flex justify-center">
          <div className="w-4 h-4 rounded-full bg-white/80 border-2 border-black" />
        </div>
        <div className={cn("flex-1 p-6 rounded-2xl max-w-[90vw] sm:max-w-none cursor-pointer", "bg-black/40 backdrop-blur-md border border-white/10", "hover:bg-black/60 transition-all duration-500", isEven ? "text-right" : "text-left")}
             onClick={() => setShowDescription(!showDescription)}>
            <h3 className="text-xl font-bold">{plan.title}</h3>
            <AnimatePresence>
              {showDescription && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-gray-400 mt-2 overflow-hidden"
                >
                  {plan.description}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="mt-2 text-sm text-gray-500">
              {showDescription ? '收起' : '点击查看详情'}
            </div>
        </div>
      </div>
    );
  } else if (viewMode === 'kanban') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => router.push(`/plans/${plan.id}`)}
        className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getPriorityIcon(plan.priority)}
            <h3 className="font-semibold line-clamp-1">{plan.title}</h3>
          </div>
          <div className="flex -space-x-2">
            {plan.plan_members?.slice(0, 2).map((member: any) => (
              <img
                key={member.user_id}
                src={member.user?.avatar_url || `https://ui-avatars.com/api/?name=${member.user?.username || 'User'}&background=6366f1&color=fff`}
                alt={member.user?.username || 'User'}
                className="w-6 h-6 rounded-full border-2 border-black"
                width={24}
                height={24}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{plan.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{plan.progress}% 完成</span>
          {plan.target_date && (
            <span>{getDueDateStatus(plan.target_date)}</span>
          )}
        </div>
      </motion.div>
    );
  }

  // 网格视图卡片
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer"
      onClick={() => router.push(`/plans/${plan.id}`)}
    >
      <img
        src={plan.cover_image || `https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=entropy&auto=format&q=60`}
        alt={plan.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      <div className={cn("absolute top-4 left-4 w-2.5 h-2.5 rounded-full border-2 border-black", plan.status === 'completed' && 'bg-green-500', plan.status === 'active' && 'bg-blue-500', plan.status === 'review' && 'bg-yellow-500', plan.status === 'draft' && 'bg-gray-500')} title={plan.status === 'completed' ? '已完成' : plan.status === 'active' ? '进行中' : plan.status === 'review' ? '审核中' : '草稿'} />

      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="relative w-12 h-12">
          <svg className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - plan.progress / 100)}`} className={cn(plan.progress >= 80 ? 'text-green-500' : plan.progress >= 50 ? 'text-blue-500' : plan.progress >= 30 ? 'text-yellow-500' : 'text-gray-400', "transition-all duration-1000")} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{plan.progress}%</div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold line-clamp-2">{plan.title}</h3>
            <p className="text-sm text-gray-300 mt-1 line-clamp-1">{plan.category}</p>
          </div>
          <div className="flex -space-x-3">
            {plan.plan_members?.slice(0, 3).map((member: any, idx: number) => (
              <img
                key={member.user_id}
                src={member.user?.avatar_url || `https://ui-avatars.com/api/?name=${member.user?.username || 'User'}&background=6366f1&color=fff`}
                alt={member.user?.username || 'User'}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black"
                width={40}
                height={40}
                style={{ zIndex: 3 - idx }}
              />
            ))}
            {plan.plan_members && plan.plan_members.length > 3 && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-xs text-white border-2 border-black" style={{ zIndex: 0 }}>
                +{plan.plan_members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};