'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export interface MinimalWishItem {
  id: string
  title: string
  imageUrl?: string
  isFavorite?: boolean
}

export interface MinimalWishCardProps {
  wish: MinimalWishItem
  onToggleFavorite?: (id: string) => void
  onClick?: () => void
  className?: string
}

export const MinimalWishCard = React.forwardRef<HTMLDivElement, MinimalWishCardProps>(
  ({ wish, onToggleFavorite, onClick, className }, ref) => {
    const { id, title, imageUrl, isFavorite = false } = wish

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleFavorite?.(id)
    }

    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative group cursor-pointer overflow-hidden',
          'bg-apple-gray-50 dark:bg-apple-gray-900',
          'rounded-2xl transition-all duration-500',
          className
        )}
        onClick={onClick}
      >
        {/* 图片 - 极简展示 */}
        {imageUrl ? (
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                'w-full h-full object-cover',
                'transition-transform duration-700',
                'group-hover:scale-105'
              )}
              loading="lazy"
            />
            
            {/* 渐变遮罩 */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/50 to-transparent',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
            )} />
            
            {/* 标题 - 悬浮显示 */}
            <div className={cn(
              'absolute inset-x-0 bottom-0 p-6',
              'transform translate-y-full group-hover:translate-y-0',
              'transition-transform duration-500 ease-apple'
            )}>
              <h3 className="text-white text-xl font-semibold line-clamp-2">
                {title}
              </h3>
            </div>

            {/* 收藏按钮 - 极简设计 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleFavoriteClick}
              className={cn(
                'absolute top-4 right-4 p-2.5 rounded-full',
                'backdrop-blur-md transition-all duration-300',
                'opacity-0 group-hover:opacity-100',
                isFavorite 
                  ? 'bg-apple-red text-white' 
                  : 'bg-white/80 text-apple-gray-600'
              )}
              aria-label={isFavorite ? '取消收藏' : '添加收藏'}
            >
              <Heart 
                size={16} 
                className={isFavorite ? 'fill-current' : ''}
              />
            </motion.button>
          </div>
        ) : (
          /* 无图片时的极简展示 */
          <div className="relative aspect-[4/5] flex items-center justify-center p-6">
            <h3 className={cn(
              'text-2xl font-semibold text-center',
              'text-apple-gray-900 dark:text-white',
              'line-clamp-3'
            )}>
              {title}
            </h3>
            
            {/* 收藏按钮 */}
            <button
              onClick={handleFavoriteClick}
              className={cn(
                'absolute top-4 right-4 p-2 rounded-full',
                'transition-all duration-300',
                isFavorite 
                  ? 'bg-apple-red text-white' 
                  : 'bg-apple-gray-200 text-apple-gray-600 hover:bg-apple-gray-300'
              )}
              aria-label={isFavorite ? '取消收藏' : '添加收藏'}
            >
              <Heart 
                size={16} 
                className={isFavorite ? 'fill-current' : ''}
              />
            </button>
          </div>
        )}
      </motion.div>
    )
  }
)

MinimalWishCard.displayName = 'MinimalWishCard' 