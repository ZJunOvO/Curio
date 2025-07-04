'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Toast as ToastType, ToastType as ToastTypeEnum, useToastStore } from '@/lib/stores/useToastStore'
import { Button } from './Button'

// Toast图标映射
const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
} as const

// Toast颜色映射
const toastColors = {
  success: {
    icon: 'text-green-500',
    border: 'border-green-200 dark:border-green-800',
    bg: 'bg-green-50/90 dark:bg-green-900/20',
  },
  error: {
    icon: 'text-red-500',
    border: 'border-red-200 dark:border-red-800',
    bg: 'bg-red-50/90 dark:bg-red-900/20',
  },
  warning: {
    icon: 'text-orange-500',
    border: 'border-orange-200 dark:border-orange-800',
    bg: 'bg-orange-50/90 dark:bg-orange-900/20',
  },
  info: {
    icon: 'text-blue-500',
    border: 'border-blue-200 dark:border-blue-800',
    bg: 'bg-blue-50/90 dark:bg-blue-900/20',
  },
} as const

// 单个Toast组件
export interface ToastItemProps {
  toast: ToastType
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToastStore()
  const Icon = toastIcons[toast.type]
  const colors = toastColors[toast.type]

  const handleClose = () => {
    removeToast(toast.id)
  }

  const handleActionClick = () => {
    if (toast.action) {
      toast.action.onClick()
      handleClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1], // Apple标准缓动
      }}
      className={cn(
        'relative w-full max-w-sm p-4 rounded-xl shadow-lg backdrop-blur-md',
        'border-2',
        colors.bg,
        colors.border,
        'glass' // 毛玻璃效果
      )}
    >
      {/* 主内容区域 */}
      <div className="flex items-start space-x-3">
        {/* 图标 */}
        <div className="flex-shrink-0">
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>

        {/* 文本内容 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-apple-gray-900 dark:text-apple-gray-100 mb-1">
            {toast.title}
          </h3>
          {toast.message && (
            <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 leading-relaxed">
              {toast.message}
            </p>
          )}
          
          {/* 操作按钮 */}
          {toast.action && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="ghost"
                onPress={handleActionClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          aria-label="关闭通知"
          className={cn(
            'flex-shrink-0 p-1 rounded-md transition-colors',
            'text-apple-gray-400 hover:text-apple-gray-600',
            'dark:text-apple-gray-500 dark:hover:text-apple-gray-300',
            'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800'
          )}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// Toast容器组件
export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore()

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-3 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Toast Provider 组件
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
} 