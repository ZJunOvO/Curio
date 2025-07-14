'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useTogetherMode() {
  const [mode, setMode] = useState<'personal' | 'shared'>('personal');
  const { user } = useAuth();

  const toggleMode = () => {
    setMode(prev => prev === 'personal' ? 'shared' : 'personal');
  };

  const getUserId = () => {
    return mode === 'personal' ? user?.id : null;
  };

  const getBindingId = () => {
    // 根据模式返回对应的绑定ID
    // 这里先返回null，后续需要根据实际的绑定关系数据来实现
    return mode === 'shared' ? getActiveBindingId() : null;
  };

  const getActiveBindingId = () => {
    // 这里需要根据实际的绑定关系数据来获取活跃的绑定ID
    // 暂时返回null，等待实际绑定数据结构确定后再实现
    return null;
  };

  const isPersonalMode = mode === 'personal';
  const isSharedMode = mode === 'shared';

  return {
    mode,
    setMode,
    toggleMode,
    getUserId,
    getBindingId,
    isPersonalMode,
    isSharedMode
  };
}