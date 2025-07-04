'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui'
import { Heart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WishItem {
  id: string
  title: string
  description?: string
  imageUrl?: string
  sourceUrl?: string
  tags?: string[]
  category?: string
  priority?: 'low' | 'medium' | 'high'
  createdAt: Date
  isFavorite?: boolean
}

export interface WishCardProps {
  wish: WishItem
  onToggleFavorite?: (id: string) => void
  onOpenWish?: (wish: WishItem) => void
  className?: string
}

const WishCard = React.forwardRef<HTMLDivElement, WishCardProps>(
  ({ wish, onToggleFavorite, onOpenWish, className }, ref) => {
    const {
      id,
      title,
      description,
      imageUrl,
      sourceUrl,
      tags = [],
      category,
      priority = 'medium',
      isFavorite = false
    } = wish

    const handleCardClick = () => {
      onOpenWish?.(wish)
    }

    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleFavorite?.(id)
    }

    const handleExternalClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (sourceUrl) {
        window.open(sourceUrl, '_blank', 'noopener,noreferrer')
      }
    }

    // 处理标签显示逻辑 - 最多显示3个，超出显示+n
    const displayTags = tags.slice(0, 3)
    const extraTagsCount = tags.length - 3

    return (
      <Card
        ref={ref}
        className={cn(
          'group cursor-pointer overflow-hidden',
          'transition-all duration-500 ease-apple',
          'hover:shadow-apple-lg hover:-translate-y-2 hover:scale-[1.02]',
          'active:scale-[0.98] active:transition-transform active:duration-150',
          'bg-white dark:bg-apple-gray-900',
          'border border-apple-gray-100/50 dark:border-apple-gray-800/50',
          'shadow-apple-sm hover:shadow-apple-lg',
          'rounded-2xl', // Apple 更喜欢更大的圆角
          className
        )}
        onClick={handleCardClick}
      >
        {/* 图片区域 - Apple 式精致设计 */}
        {imageUrl && (
          <div className="relative overflow-hidden">
            <img
              src={imageUrl}
              alt={title}
              className={cn(
                'w-full object-cover transition-all duration-700 ease-apple',
                'group-hover:scale-110', // 更大的缩放效果
                // 移动端使用1:1比例，桌面端使用4:5比例（更符合Apple风格）
                'aspect-square sm:aspect-[4/5]'
              )}
              loading="lazy"
            />
            
            {/* 精致的渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* 优先级指示器 - 更精致的设计 */}
            {priority === 'high' && (
              <div className="absolute top-3 left-3">
                <div className="w-2 h-2 bg-apple-red rounded-full shadow-lg animate-pulse" />
              </div>
            )}

            {/* 图片上的小标签 - 毛玻璃效果，最多一行 */}
            {(category || tags.length > 0) && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex flex-wrap gap-1 items-center max-w-full">
                  {/* 分类标签 - 毛玻璃效果 */}
                  {category && (
                    <span className={cn(
                      'px-2 py-1 text-xs font-medium rounded-full',
                      'bg-white/20 backdrop-blur-xl border border-white/30',
                      'text-white shadow-lg'
                    )}>
                      {category}
                    </span>
                  )}
                  
                  {/* 小标签 - 毛玻璃效果 */}
                  {displayTags.map((tag, index) => (
                    <span 
                      key={index}
                      className={cn(
                        'px-2 py-1 text-xs rounded-full',
                        'bg-black/20 backdrop-blur-xl border border-white/20',
                        'text-white/90'
                      )}
                    >
                      #{tag}
                    </span>
                  ))}
                  
                  {/* 超出标签数量显示 */}
                  {extraTagsCount > 0 && (
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      'bg-black/30 backdrop-blur-xl border border-white/20',
                      'text-white/80'
                    )}>
                      +{extraTagsCount}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* 收藏按钮 - Apple 风格精致设计 */}
            <button
              onClick={handleFavoriteClick}
              className={cn(
                'absolute top-3 right-3 rounded-full',
                'backdrop-blur-lg transition-all duration-300 ease-apple',
                'hover:scale-110 active:scale-95',
                'shadow-lg border border-white/20',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
                // 响应式大小
                'p-2 sm:p-2.5',
                isFavorite 
                  ? 'bg-apple-red/95 text-white shadow-apple-red/25' 
                  : 'bg-white/90 text-apple-gray-600 hover:bg-white hover:text-apple-red'
              )}
              aria-label={isFavorite ? '取消收藏' : '添加收藏'}
            >
              <Heart 
                size={14} 
                className={cn(
                  'sm:w-4 sm:h-4',
                  'transition-all duration-300',
                  isFavorite && 'fill-current scale-110'
                )} 
              />
            </button>

            {/* 外部链接按钮 - 桌面端精致显示 */}
            {sourceUrl && (
              <button
                onClick={handleExternalClick}
                className={cn(
                  'absolute bottom-3 right-3 p-2 rounded-full',
                  'bg-white/90 backdrop-blur-lg text-apple-gray-600',
                  'hover:bg-white hover:text-apple-blue',
                  'transition-all duration-300 ease-apple hover:scale-110',
                  'opacity-0 group-hover:opacity-100',
                  'shadow-lg border border-white/20',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue',
                  // 移动端隐藏
                  'hidden sm:block'
                )}
                aria-label="查看原链接"
              >
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        )}

        {/* 内容区域 - Apple 式精致布局，去除大标签显示 */}
        <CardContent className={cn(
          'space-y-3',
          // 更符合Apple的内边距系统
          'p-4 sm:p-5'
        )}>
          {/* 移动端外部链接图标 - 只在有sourceUrl时显示 */}
          {sourceUrl && (
            <div className="flex justify-end sm:hidden">
              <button
                onClick={handleExternalClick}
                className={cn(
                  'p-1.5 rounded-full',
                  'text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10',
                  'transition-all duration-200 hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue'
                )}
                aria-label="查看原链接"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          )}

          {/* 标题 - Apple 字体层次 */}
          <h3 className={cn(
            'font-semibold text-apple-gray-950 dark:text-white',
            'line-clamp-2 leading-tight tracking-tight',
            'group-hover:text-apple-blue transition-colors duration-300',
            // Apple 标准字体尺寸
            'text-sm sm:text-base'
          )}>
            {title}
          </h3>
          
          {/* 描述 - 精致的字体层次 */}
          {description && (
            <p className={cn(
              'text-apple-gray-600 dark:text-apple-gray-400 line-clamp-2 leading-relaxed',
              // 移动端隐藏描述以保持简洁
              'hidden sm:block text-sm opacity-80'
            )}>
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
)

WishCard.displayName = 'WishCard'

export { WishCard } 