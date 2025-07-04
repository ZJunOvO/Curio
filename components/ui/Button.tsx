'use client'

import React from 'react'
import { Button as HeroButton, ButtonProps as HeroButtonProps } from '@heroui/react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends Omit<HeroButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    icon, 
    iconPosition = 'left',
    children, 
    className,
    ...props 
  }, ref) => {
    // 映射到HeroUI的类型
    const getHeroVariant = (variant: ButtonProps['variant']) => {
      switch (variant) {
        case 'primary': return 'solid'
        case 'secondary': return 'bordered'
        case 'ghost': return 'light'
        case 'danger': return 'solid'
        case 'success': return 'solid'
        default: return 'solid'
      }
    }

    const getHeroColor = (variant: ButtonProps['variant']) => {
      switch (variant) {
        case 'primary': return 'primary'
        case 'secondary': return 'default'
        case 'ghost': return 'default'
        case 'danger': return 'danger'
        case 'success': return 'success'
        default: return 'primary'
      }
    }

    const getHeroSize = (size: ButtonProps['size']) => {
      switch (size) {
        case 'sm': return 'sm'
        case 'md': return 'md'
        case 'lg': return 'lg'
        default: return 'md'
      }
    }

    const baseStyles = cn(
      // Apple Design 基础样式
      'font-medium transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:pointer-events-none',
      'rounded-apple shadow-apple-sm hover:shadow-apple',
      
      // 交互效果
      'active:scale-[0.98] hover:scale-[1.02]',
      'transform-gpu will-change-transform',
      
      // 变体特定样式
      {
        'bg-apple-blue text-white hover:bg-opacity-90 active:bg-opacity-80': variant === 'primary',
        'border-apple-gray-300 text-apple-gray-700 hover:bg-apple-gray-50 active:bg-apple-gray-100': variant === 'secondary',
        'text-apple-gray-600 hover:bg-apple-gray-100 active:bg-apple-gray-200': variant === 'ghost',
        'bg-apple-red text-white hover:bg-opacity-90 active:bg-opacity-80': variant === 'danger',
        'bg-apple-green text-white hover:bg-opacity-90 active:bg-opacity-80': variant === 'success',
      },
      
      className
    )

    const iconElement = icon && (
      <span className={cn(
        'flex items-center',
        children && (iconPosition === 'left' ? 'mr-2' : 'ml-2')
      )}>
        {icon}
      </span>
    )

    return (
      <HeroButton
        ref={ref}
        variant={getHeroVariant(variant)}
        color={getHeroColor(variant)}
        size={getHeroSize(size)}
        className={baseStyles}
        {...props}
      >
        <span className="flex items-center justify-center">
          {iconPosition === 'left' && iconElement}
          {children}
          {iconPosition === 'right' && iconElement}
        </span>
      </HeroButton>
    )
  }
)

Button.displayName = 'Button' 