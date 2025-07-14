'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, DollarSign, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'personal' | 'shared';
  onAddAction?: (type: 'todo' | 'finance' | 'note', mode: 'personal' | 'shared') => void;
}

const AddActionModal: React.FC<AddActionModalProps> = ({
  isOpen,
  onClose,
  mode,
  onAddAction
}) => {
  const [activeTab, setActiveTab] = useState<'todo' | 'finance' | 'note'>('todo');
  
  const addOptions = [
    {
      id: 'todo' as const,
      title: '待办事项',
      description: '添加新的任务或提醒',
      icon: CheckCircle,
      color: 'purple'
    },
    {
      id: 'finance' as const,
      title: '财务记录',
      description: '记录收入或支出',
      icon: DollarSign,
      color: 'green'
    },
    {
      id: 'note' as const,
      title: '备忘录',
      description: '记录重要信息或想法',
      icon: FileText,
      color: 'blue'
    }
  ];

  const handleAddAction = (type: 'todo' | 'finance' | 'note') => {
    if (onAddAction) {
      onAddAction(type, mode);
    }
    onClose();
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">添加内容</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 选项卡 */}
            <div className="space-y-3">
              {addOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveTab(option.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border transition-all text-left',
                    activeTab === option.id
                      ? 'border-white/20 bg-white/5'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      option.color === 'purple' && 'bg-purple-500/20',
                      option.color === 'green' && 'bg-green-500/20',
                      option.color === 'blue' && 'bg-blue-500/20'
                    )}>
                      <option.icon className={cn(
                        'w-5 h-5',
                        option.color === 'purple' && 'text-purple-400',
                        option.color === 'green' && 'text-green-400',
                        option.color === 'blue' && 'text-blue-400'
                      )} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm text-gray-400">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* 身份选择 */}
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400 mb-2">添加到：</p>
              <div className="flex gap-2">
                <span className={cn(
                  'px-3 py-1 rounded-full text-sm',
                  mode === 'personal' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-purple-500/20 text-purple-400'
                )}>
                  {mode === 'personal' ? '个人数据' : '共享数据'}
                </span>
              </div>
            </div>
            
            {/* 确认按钮 */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleAddAction(activeTab)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all"
              >
                确认
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddActionModal;