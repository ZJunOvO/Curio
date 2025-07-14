'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Heart, Layers3, Calendar, X, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/stores/useUIStore';
import { toast } from '@/lib/stores/useToastStore';
import dynamic from 'next/dynamic';

// 通用模块预加载策略 - 优化大模块间切换延迟
const preloadModuleComponents = {
  together: () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 开始预加载Together页面组件...');
      
      // 预加载FinanceTracker
      import('@/components/core/FinanceTracker').then(() => {
        console.log('✅ FinanceTracker预加载完成');
      });
      
      // 预加载TodoList  
      import('@/components/core/TodoList').then(() => {
        console.log('✅ TodoList预加载完成');
      });
      
      // 预加载StatsDashboard
      import('@/components/core/StatsDashboard').then(() => {
        console.log('✅ StatsDashboard预加载完成');
      });
    }
  },
  
  plans: () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 开始预加载Plans页面组件...');
      
      // 预加载计划相关组件
      import('@/components/core/charts').then(() => {
        console.log('✅ PlanStatsDashboard预加载完成');
      });
      
      import('@/components/core/ShareModal').then(() => {
        console.log('✅ ShareModal预加载完成');
      });
      
      import('@/components/ui/ImageUpload').then(() => {
        console.log('✅ ImageUpload预加载完成');
      });
    }
  },
  
  wishes: () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 开始预加载Wishes页面组件...');
      
      // 预加载心愿相关组件
      import('@/components/core/WishCard').then(() => {
        console.log('✅ WishCard预加载完成');
      }).catch(() => {
        console.log('⚠️ WishCard组件不存在，跳过预加载');
      });
      
      import('@/components/core/WishGallery').then(() => {
        console.log('✅ WishGallery预加载完成');
      }).catch(() => {
        console.log('⚠️ WishGallery组件不存在，跳过预加载');
      });
    }
  }
};

// 预加载Together页面的重型组件（向后兼容）
const preloadTogetherComponents = preloadModuleComponents.together;

// 路由预加载策略 - 优化页面切换速度
const preloadRoutes = {
  '/plans': () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 预加载Plans路由...');
      // 预加载Plans页面
      import('../../app/plans/page').then(() => {
        console.log('✅ Plans页面预加载完成');
      }).catch(() => {
        console.log('⚠️ Plans页面预加载失败');
      });
    }
  },
  
  '/together': () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 预加载Together路由...');
      // 预加载Together页面
      import('../../app/together/page').then(() => {
        console.log('✅ Together页面预加载完成');
      }).catch(() => {
        console.log('⚠️ Together页面预加载失败');
      });
    }
  },
  
  '/add-wish': () => {
    if (typeof window !== 'undefined') {
      console.log('🚀 预加载AddWish路由...');
      // 预加载AddWish页面
      import('../../app/add-wish/page').then(() => {
        console.log('✅ AddWish页面预加载完成');
      }).catch(() => {
        console.log('⚠️ AddWish页面预加载失败');
      });
    }
  }
};

export function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 模块预加载状态管理
  const [preloadStatus, setPreloadStatus] = useState({
    together: false,
    plans: false,
    wishes: false
  });
  
  // 路由预加载状态管理
  const [routePreloadStatus, setRoutePreloadStatus] = useState({
    '/plans': false,
    '/together': false,
    '/add-wish': false
  });
  
  // 使用全局UI状态
  const { 
    showFavorites, 
    isNavExpanded,
    toggleShowFavorites,
    setIsNavExpanded
  } = useUIStore();

  // 展开/收起导航栏
  const expandNav = () => setIsNavExpanded(true);
  const collapseNav = () => setIsNavExpanded(false);

  // 导航到添加心愿页面
  const navigateToAddWish = () => router.push('/add-wish');

  // 切换收藏显示并提供反馈
  const handleToggleFavorites = () => {
    const newState = !showFavorites;
    toggleShowFavorites();
    
    if (newState) {
      toast.info(
        '只显示收藏',
        '当前显示你收藏的心愿，可以随时切换回全部显示。'
      );
    } else {
      toast.info(
        '显示全部心愿',
        '当前显示所有心愿，包括未收藏的内容。'
      );
    }
  };

  // 通用模块悬停预加载处理
  const handleModuleHover = (moduleName: keyof typeof preloadStatus) => {
    if (!preloadStatus[moduleName]) {
      preloadModuleComponents[moduleName]();
      setPreloadStatus(prev => ({
        ...prev,
        [moduleName]: true
      }));
    }
  };
  
  // 路由预加载处理
  const handleRoutePreload = (route: keyof typeof routePreloadStatus) => {
    if (!routePreloadStatus[route]) {
      preloadRoutes[route]();
      setRoutePreloadStatus(prev => ({
        ...prev,
        [route]: true
      }));
    }
  };
  
  // 综合预加载处理 - 同时预加载组件和路由
  const handleComprehensivePreload = (moduleName: keyof typeof preloadStatus, route: keyof typeof routePreloadStatus) => {
    handleModuleHover(moduleName);
    handleRoutePreload(route);
  };
  
  // 处理Together按钮悬停预加载（向后兼容）
  const handleTogetherHover = () => handleModuleHover('together');

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNavExpanded) {
        collapseNav();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavExpanded]);

  const isHomePage = pathname === '/';

  return (
    <>
      {/* 收起状态 - 悬浮按钮 */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 transition-all duration-300',
          isNavExpanded ? 'scale-75 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        )}
      >
        <button
          onClick={expandNav}
          className={cn(
            'p-4 rounded-full text-white shadow-2xl',
            'bg-white/10 backdrop-blur-2xl border border-white/20',
            'hover:bg-white/20 transition-all duration-300',
            'hover:scale-105 active:scale-95'
          )}
          aria-label="展开导航菜单"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* 展开状态 - 紧凑型导航栏 */}
      <div
        className={cn(
          'fixed bottom-6 left-6 right-6 z-50 transition-all duration-300',
          isNavExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={false}
            animate={isNavExpanded ? "open" : "closed"}
            variants={{
              open: { scale: 1, y: 0 },
              closed: { scale: 0.9, y: '120%' }
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'relative flex items-center justify-between',
              'bg-white/10 backdrop-blur-2xl rounded-2xl',
              'p-3 border border-white/20 shadow-2xl'
            )}
          >
            {/* 左侧：导航按钮 */}
            <div className="flex gap-1">
              <button
                onClick={() => router.push('/')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  pathname === '/' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                )}
                aria-label="打开主页"
              >
                <Layers3 size={18} />
              </button>
              <button
                onClick={() => router.push('/plans')}
                onMouseEnter={() => handleComprehensivePreload('plans', '/plans')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  pathname.startsWith('/plans') ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                )}
                aria-label="打开计划页面"
              >
                <Calendar size={18} />
              </button>
              <button
                onClick={() => router.push('/together')}
                onMouseEnter={() => handleComprehensivePreload('together', '/together')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  pathname.startsWith('/together') ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                )}
                aria-label="打开Together页面"
              >
                <Users size={18} />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  pathname.startsWith('/profile') ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                )}
                aria-label="打开个人中心"
              >
                <User size={18} />
              </button>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex gap-1">
              {isHomePage && (
                <button
                  onClick={handleToggleFavorites}
                  onMouseEnter={() => handleModuleHover('wishes')}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-300',
                    'hover:scale-105 active:scale-95',
                    showFavorites 
                      ? 'bg-apple-red text-white shadow-lg' 
                      : 'text-white hover:bg-white/10'
                  )}
                  aria-label={showFavorites ? "显示所有心愿" : "只显示收藏"}
                >
                  <Heart size={18} className={showFavorites ? 'fill-current' : ''} />
                </button>
              )}
              <button
                onClick={navigateToAddWish}
                onMouseEnter={() => handleComprehensivePreload('wishes', '/add-wish')}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'bg-apple-blue text-white shadow-lg hover:bg-apple-blue/80',
                  'hover:scale-105 active:scale-95'
                )}
                aria-label="添加新心愿"
              >
                <Plus size={18} />
              </button>
              {/* 关闭按钮 */}
              <button
                onClick={collapseNav}
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'text-white/60 hover:text-white hover:bg-white/10',
                  'hover:scale-105 active:scale-95 ml-3'
                )}
                aria-label="关闭导航菜单"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 遮罩层已移除 - 用户可以通过关闭按钮来收起导航栏 */}
    </>
  );
} 