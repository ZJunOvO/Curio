'use client';

import React from 'react';
import { Plus, Heart, Users, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TogetherHeaderProps {
  currentMode: 'personal' | 'shared';
  onModeChange: (mode: 'personal' | 'shared') => void;
  onAddAction: () => void;
  activeBinding?: any;
  boundUser?: any;
}

const TogetherHeader: React.FC<TogetherHeaderProps> = ({
  currentMode,
  onModeChange,
  onAddAction,
  activeBinding,
  boundUser
}) => {
  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* 标题和模式切换 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Together</h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                {activeBinding ? (
                  <>
                    <Users size={14} />
                    <span>与 {boundUser?.username || '伙伴'} 一起</span>
                  </>
                ) : (
                  <>
                    <Link size={14} />
                    <span>还没有绑定伙伴</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* 模式切换 */}
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <button
              onClick={() => onModeChange('personal')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all',
                currentMode === 'personal' 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              个人
            </button>
            <button
              onClick={() => onModeChange('shared')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-all',
                currentMode === 'shared' 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white'
              )}
            >
              共享
            </button>
          </div>
        </div>
        
        {/* 添加按钮 */}
        <div className="flex items-center justify-end">
          <button
            onClick={onAddAction}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>
    </div>
  );
};

export default TogetherHeader;