'use client'

import React from 'react'
import { Input as HeroInput, InputProps as HeroInputProps } from '@heroui/react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<HeroInputProps, 'size' | 'variant'> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'flat' | 'bordered' | 'underlined'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    size = 'md',
    variant = 'bordered',
    icon,
    iconPosition = 'left',
    error,
    helperText,
    className,
    ...props 
  }, ref) => {
    const getHeroSize = (size: InputProps['size']) => {
      switch (size) {
        case 'sm': return 'sm'
        case 'md': return 'md'
        case 'lg': return 'lg'
        default: return 'md'
      }
    }

    const getHeroVariant = (variant: InputProps['variant']) => {
      switch (variant) {
        case 'flat': return 'flat'
        case 'bordered': return 'bordered'
        case 'underlined': return 'underlined'
        default: return 'bordered'
      }
    }

    const baseStyles = cn(
      // Apple Design 基础样式
      'transition-all duration-200 ease-out',
      'focus-within:ring-2 focus-within:ring-apple-blue focus-within:ring-offset-1',
      
      // 圆角
      variant !== 'underlined' && 'rounded-apple',
      
      // 错误状态
      error && [
        'border-apple-red focus-within:border-apple-red',
        'focus-within:ring-apple-red'
      ],
      
      className
    )

    const iconElement = icon && (
      <div className={cn(
        'flex items-center justify-center',
        'text-apple-gray-400',
        iconPosition === 'left' ? 'pl-3' : 'pr-3'
      )}>
        {icon}
      </div>
    )

    return (
      <div className="space-y-1">
        <HeroInput
          ref={ref}
          size={getHeroSize(size)}
          variant={getHeroVariant(variant)}
          isInvalid={!!error}
          errorMessage={error}
          description={!error ? helperText : undefined}
          classNames={{
            base: baseStyles,
            inputWrapper: cn(
              'shadow-apple-sm hover:shadow-apple',
              'border-apple-gray-200 dark:border-apple-gray-700',
              'bg-white dark:bg-apple-gray-900',
              error && 'border-apple-red'
            ),
            input: cn(
              'text-apple-gray-900 dark:text-apple-gray-100',
              'placeholder:text-apple-gray-400'
            ),
            errorMessage: 'text-apple-red text-sm',
            description: 'text-apple-gray-500 text-sm'
          }}
          startContent={iconPosition === 'left' ? iconElement : undefined}
          endContent={iconPosition === 'right' ? iconElement : undefined}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input' 