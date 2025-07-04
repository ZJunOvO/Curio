'use client'

import React from 'react'
import { Spinner, CircularProgress } from '@heroui/react'
import { cn } from '@/lib/utils'

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'circular' | 'dots'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  label?: string
  className?: string
}

export interface LoadingSkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ 
    size = 'md',
    variant = 'spinner',
    color = 'primary',
    label,
    className,
    ...props 
  }, ref) => {
    const sizeMap = {
      sm: variant === 'circular' ? 'w-6 h-6' : 'text-sm',
      md: variant === 'circular' ? 'w-8 h-8' : 'text-base',
      lg: variant === 'circular' ? 'w-12 h-12' : 'text-lg'
    }

    const colorMap = {
      primary: 'text-apple-blue',
      secondary: 'text-apple-purple',
      success: 'text-apple-green',
      warning: 'text-apple-orange',
      danger: 'text-apple-red'
    }

    const baseStyles = cn(
      'flex flex-col items-center justify-center gap-2',
      className
    )

    const renderSpinner = () => {
      if (variant === 'circular') {
        return (
          <CircularProgress
            size={size}
            color={color}
            aria-label={label || '加载中...'}
            classNames={{
              base: sizeMap[size],
              svg: 'drop-shadow-md',
              track: 'stroke-apple-gray-200 dark:stroke-apple-gray-700',
              indicator: cn('stroke-current', colorMap[color])
            }}
          />
        )
      }

      if (variant === 'dots') {
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-current animate-pulse',
                  colorMap[color],
                  {
                    'w-2 h-2': size === 'sm',
                    'w-3 h-3': size === 'md',
                    'w-4 h-4': size === 'lg'
                  }
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )
      }

      return (
        <Spinner
          size={size}
          color={color}
          classNames={{
            wrapper: 'drop-shadow-md',
            circle1: 'border-apple-gray-200 dark:border-apple-gray-700',
            circle2: cn('border-current', colorMap[color])
          }}
        />
      )
    }

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {renderSpinner()}
        {label && (
          <span className={cn(
            'text-apple-gray-600 dark:text-apple-gray-400 font-medium',
            sizeMap[size]
          )}>
            {label}
          </span>
        )}
      </div>
    )
  }
)

// 骨架屏组件
export const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, width, height, rounded = false, ...props }, ref) => {
    const styles = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-apple-gray-200 dark:bg-apple-gray-700',
          rounded ? 'rounded-full' : 'rounded-apple',
          className
        )}
        style={styles}
        {...props}
      />
    )
  }
)

// 页面加载组件
export const PageLoading = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-apple-gray-900 rounded-apple-lg shadow-apple-xl p-8 mx-4">
        <Loading size="lg" label="加载中..." />
      </div>
    </div>
  )
}

// 按钮加载态
export const ButtonLoading = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  return (
    <Loading 
      size={size} 
      variant="spinner" 
      className={cn(
        {
          'w-4 h-4': size === 'sm',
          'w-5 h-5': size === 'md', 
          'w-6 h-6': size === 'lg'
        }
      )}
    />
  )
}

Loading.displayName = 'Loading'
LoadingSkeleton.displayName = 'LoadingSkeleton' 