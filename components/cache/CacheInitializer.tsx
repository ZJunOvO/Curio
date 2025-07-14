'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { setupCacheMonitoring, warmupCache } from '@/lib/cache/CacheUtils';

/**
 * 缓存初始化组件
 * 负责设置缓存监控和预热用户缓存
 */
export function CacheInitializer() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // 设置缓存监控
    setupCacheMonitoring();
    
    // 在开发环境下输出缓存调试信息
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 缓存系统已初始化');
    }
  }, []);

  useEffect(() => {
    // 当用户登录后，预热缓存
    if (!isLoading && user) {
      warmupCache(user.id).catch(error => {
        console.warn('缓存预热失败:', error);
      });
    }
  }, [user, isLoading]);

  // 这个组件不渲染任何内容
  return null;
}

export default CacheInitializer;