/**
 * 缓存工具函数
 * 提供缓存管理、监控和调试工具
 */

import { planCache, userCache, globalCache, wishCache } from './DataCache';

export type CacheType = 'plan' | 'user' | 'global' | 'wish';

/**
 * 获取指定类型的缓存实例
 */
export function getCacheInstance(type: CacheType) {
  switch (type) {
    case 'plan': return planCache;
    case 'user': return userCache;
    case 'global': return globalCache;
    case 'wish': return wishCache;
    default: return globalCache;
  }
}

/**
 * 清除所有缓存
 */
export function clearAllCaches(): void {
  planCache.clear();
  userCache.clear();
  globalCache.clear();
  wishCache.clear();
  console.log('🧹 所有缓存已清空');
}

/**
 * 清除用户相关的所有缓存
 */
export function clearUserCaches(userId: string): void {
  // 清除用户资料缓存
  userCache.delete(`user_profile_${userId}`);
  
  // 清除用户的计划缓存
  planCache.delete(`user_plans_${userId}`);
  
  // 清除用户的心愿缓存
  wishCache.delete(`user_wishes_${userId}`);
  
  console.log(`🧹 用户 ${userId} 的相关缓存已清空`);
}

/**
 * 清除计划相关的所有缓存
 */
export function clearPlanCaches(planId: string): void {
  planCache.delete(`plan_details_${planId}`);
  
  // 清除所有用户的计划列表缓存（因为计划可能涉及多个用户）
  planCache.invalidate('user_plans_');
  
  console.log(`🧹 计划 ${planId} 的相关缓存已清空`);
}

/**
 * 获取所有缓存的统计信息
 */
export function getCacheStats() {
  const stats = {
    plan: planCache.getStats(),
    user: userCache.getStats(),
    global: globalCache.getStats(),
    wish: wishCache.getStats(),
    total: {
      memoryItems: 0,
      totalSize: 0,
      hitRate: 0
    }
  };
  
  // 计算总计
  stats.total.memoryItems = Object.values(stats).reduce((sum, stat) => {
    return typeof stat === 'object' && 'memoryItems' in stat ? sum + stat.memoryItems : sum;
  }, 0);
  
  stats.total.totalSize = Object.values(stats).reduce((sum, stat) => {
    return typeof stat === 'object' && 'totalSize' in stat ? sum + stat.totalSize : sum;
  }, 0);
  
  return stats;
}

/**
 * 预热缓存 - 为常用数据预先加载缓存
 */
export async function warmupCache(userId: string): Promise<void> {
  console.log('🔥 开始预热缓存...');
  
  try {
    // 预加载用户资料
    const { getUserProfile } = await import('../supabase/database');
    await getUserProfile(userId);
    
    // 预加载用户计划
    const { getUserPlans } = await import('../supabase/database');
    await getUserPlans(userId);
    
    // 预加载用户心愿
    const { getUserWishes } = await import('../supabase/database');
    await getUserWishes(userId);
    
    console.log('✅ 缓存预热完成');
  } catch (error) {
    console.error('❌ 缓存预热失败:', error);
  }
}

/**
 * 缓存健康检查
 */
export function cacheHealthCheck(): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} {
  const stats = getCacheStats();
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // 检查内存使用情况
  if (stats.total.totalSize > 10 * 1024 * 1024) { // 10MB
    issues.push('缓存占用内存过大');
    recommendations.push('考虑清理部分缓存或调整TTL');
  }
  
  // 检查缓存项数量
  if (stats.total.memoryItems > 500) {
    issues.push('缓存项目过多');
    recommendations.push('考虑增加自动清理机制');
  }
  
  // 检查命中率（如果实现了的话）
  if (stats.total.hitRate > 0 && stats.total.hitRate < 0.7) {
    issues.push('缓存命中率偏低');
    recommendations.push('检查缓存策略和TTL设置');
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * 格式化缓存大小
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 打印缓存报告
 */
export function printCacheReport(): void {
  const stats = getCacheStats();
  const health = cacheHealthCheck();
  
  console.group('📊 缓存报告');
  
  console.log('📈 统计信息:');
  console.table({
    '计划缓存': {
      项目数: stats.plan.memoryItems,
      大小: formatCacheSize(stats.plan.totalSize)
    },
    '用户缓存': {
      项目数: stats.user.memoryItems,
      大小: formatCacheSize(stats.user.totalSize)
    },
    '心愿缓存': {
      项目数: stats.wish.memoryItems,
      大小: formatCacheSize(stats.wish.totalSize)
    },
    '全局缓存': {
      项目数: stats.global.memoryItems,
      大小: formatCacheSize(stats.global.totalSize)
    }
  });
  
  console.log(`🏥 健康状态: ${health.healthy ? '✅ 健康' : '⚠️ 有问题'}`);
  
  if (health.issues.length > 0) {
    console.log('❌ 问题:');
    health.issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  if (health.recommendations.length > 0) {
    console.log('💡 建议:');
    health.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  console.groupEnd();
}

/**
 * 设置缓存监控
 */
export function setupCacheMonitoring(): void {
  // 定期检查缓存健康状态
  setInterval(() => {
    const health = cacheHealthCheck();
    if (!health.healthy) {
      console.warn('⚠️ 缓存健康检查发现问题:', health.issues);
    }
  }, 5 * 60 * 1000); // 每5分钟检查一次
  
  // 在开发环境下提供调试命令
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).cacheUtils = {
      clearAll: clearAllCaches,
      clearUser: clearUserCaches,
      clearPlan: clearPlanCaches,
      stats: getCacheStats,
      report: printCacheReport,
      warmup: warmupCache,
      health: cacheHealthCheck
    };
    
    console.log('🛠️ 缓存调试工具已加载到 window.cacheUtils');
  }
}