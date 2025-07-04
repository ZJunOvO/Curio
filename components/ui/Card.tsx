'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps {
  children: React.ReactNode
  className?: string
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  hoverable?: boolean
  clickable?: boolean
  onClick?: () => void
}

export interface CardSectionProps {
  children: React.ReactNode
  className?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    children,
    className,
    shadow = 'sm',
    padding = 'md',
    radius = 'md',
    bordered = false,
    hoverable = false,
    clickable = false,
    onClick,
    ...props 
  }, ref) => {
    const shadowStyles = {
      none: 'shadow-none',
      sm: 'shadow-apple-sm',
      md: 'shadow-apple',
      lg: 'shadow-apple-lg'
    }[shadow]

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    }[padding]

    const radiusStyles = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-apple',
      lg: 'rounded-apple-lg'
    }[radius]

    const baseStyles = cn(
      // Apple Design 基础样式
      'bg-white dark:bg-apple-gray-900',
      'transition-all duration-200 ease-out',
      'will-change-transform',
      
      // 阴影
      shadowStyles,
      
      // 圆角
      radiusStyles,
      
      // 内边距 - 仅在非clickable时应用
      !clickable && paddingStyles,
      
      // 边框
      bordered && 'border border-apple-gray-200 dark:border-apple-gray-800',
      
      // 悬浮效果
      hoverable && 'hover:shadow-apple-lg hover:-translate-y-1',
      
      // 可点击效果
      clickable && [
        'cursor-pointer',
        'active:scale-[0.98]',
        'hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2'
      ],
      
      className
    )

    return (
      <div
        ref={ref}
        className={baseStyles}
        onClick={onClick}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardHeaderComponent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pb-2 pt-0 px-0',
          'border-b border-apple-gray-100 dark:border-apple-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardContentComponent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('py-2', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

const CardFooterComponent = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'pt-2 pb-0 px-0',
          'border-t border-apple-gray-100 dark:border-apple-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
CardHeaderComponent.displayName = 'CardHeader'
CardContentComponent.displayName = 'CardContent'
CardFooterComponent.displayName = 'CardFooter'

export { Card, CardHeaderComponent as CardHeader, CardContentComponent as CardContent, CardFooterComponent as CardFooter } 