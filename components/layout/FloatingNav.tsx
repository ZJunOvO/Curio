'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, Heart, Layers3, Calendar, X, Grid3X3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useUIStore } from '@/lib/stores/useUIStore';
import { toast } from '@/lib/stores/useToastStore';

export function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  
  // 使用全局UI状态
  const { 
    viewMode,
    showFavorites, 
    isNavExpanded,
    setViewMode,
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
                className={cn(
                  'p-2.5 rounded-xl transition-all duration-300',
                  'hover:scale-105 active:scale-95',
                  pathname.startsWith('/plans') ? 'bg-white text-black' : 'text-white hover:bg-white/10'
                )}
                aria-label="打开计划页面"
              >
                <Calendar size={18} />
              </button>
            </div>

            {/* 中间：主页视图切换按钮 */}
            {isHomePage && (
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('flow')}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-300',
                    'hover:scale-105 active:scale-95',
                    viewMode === 'flow' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  )}
                  aria-label="流动视图"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => setViewMode('minimal')}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-300',
                    'hover:scale-105 active:scale-95',
                    viewMode === 'minimal' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                  )}
                  aria-label="极简视图"
                >
                  <Grid3X3 size={16} />
                </button>
              </div>
            )}

            {/* 右侧：操作按钮 */}
            <div className="flex gap-1">
              {isHomePage && (
                <button
                  onClick={handleToggleFavorites}
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

      {/* 点击外部收起导航栏 */}
      {isNavExpanded && (
        <div 
          className="fixed inset-0 z-30"
          onClick={collapseNav}
          aria-hidden="true"
        />
      )}
    </>
  );
} 