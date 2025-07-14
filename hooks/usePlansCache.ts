'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { getUserPlans } from '@/lib/supabase/database';

/**
 * 计划列表缓存hook - 优化列表页面性能
 * 减少从创建页面返回时的重新查询延迟
 */
export function usePlansCache() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const isFirstLoad = useRef(true);
  
  // 缓存有效期：5分钟
  const CACHE_VALIDITY_MS = 5 * 60 * 1000;
  
  const loadPlans = async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const now = Date.now();
    const shouldUseCache = !forceRefresh && 
                          !isFirstLoad.current && 
                          (now - lastFetchTime) < CACHE_VALIDITY_MS &&
                          plans.length > 0;
    
    if (shouldUseCache) {
      console.log('✅ 使用缓存的计划列表，跳过网络请求');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 加载计划列表...');
      
      const userPlans = await getUserPlans(user.id);
      setPlans(userPlans || []);
      setLastFetchTime(now);
      isFirstLoad.current = false;
      
      console.log('✅ 计划列表加载完成:', userPlans?.length || 0, '个计划');
    } catch (error) {
      console.error('❌ 加载计划列表失败:', error);
      // 保持现有数据，不清空列表
    } finally {
      setLoading(false);
    }
  };
  
  // 添加新计划到缓存（用于创建页面调用）
  const addPlanToCache = (newPlan: any) => {
    setPlans(prevPlans => [newPlan, ...prevPlans]);
    console.log('✅ 新计划已添加到本地缓存');
  };
  
  // 更新缓存中的计划
  const updatePlanInCache = (planId: string, updates: any) => {
    setPlans(prevPlans => 
      prevPlans.map(plan => 
        plan.id === planId ? { ...plan, ...updates } : plan
      )
    );
    console.log('✅ 计划缓存已更新');
  };
  
  // 从缓存中删除计划
  const removePlanFromCache = (planId: string) => {
    setPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    console.log('✅ 计划已从缓存中移除');
  };
  
  // 预加载计划列表（用于其他页面调用）
  const preloadPlans = async () => {
    if (!user) return;
    
    // 后台预加载，不显示loading状态
    try {
      console.log('🔄 后台预加载计划列表...');
      const userPlans = await getUserPlans(user.id);
      setPlans(userPlans || []);
      setLastFetchTime(Date.now());
      console.log('✅ 预加载完成');
    } catch (error) {
      console.error('❌ 预加载失败:', error);
    }
  };
  
  // 检查缓存是否有效
  const isCacheValid = () => {
    const now = Date.now();
    return (now - lastFetchTime) < CACHE_VALIDITY_MS && plans.length > 0;
  };
  
  // 强制刷新
  const refreshPlans = () => {
    loadPlans(true);
  };
  
  useEffect(() => {
    if (user && isFirstLoad.current) {
      loadPlans();
    }
  }, [user]);
  
  return {
    plans,
    loading,
    loadPlans,
    addPlanToCache,
    updatePlanInCache,
    removePlanFromCache,
    preloadPlans,
    refreshPlans,
    isCacheValid
  };
}