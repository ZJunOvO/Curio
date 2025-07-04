'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, Heart, Grid3X3, Layers3, Calendar, Image, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { mockWishes } from '@/lib/mock-data'
import { cn, generateGradient } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useUIStore } from '@/lib/stores/useUIStore'

export default function HomePage() {
  const router = useRouter()
  
  // 使用全局UI状态
  const { viewMode, showFavorites } = useUIStore()
  
  const [activeIndex, setActiveIndex] = useState(0)
  // 收藏状态管理
  // TODO: P-35 - 从API获取真实心愿数据替换mockWishes
  const [wishesState, setWishesState] = useState(mockWishes)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  const filteredWishes = showFavorites 
    ? wishesState.filter(w => w.isFavorite)
    : wishesState

  // 切换收藏状态
  const toggleFavorite = (wishId: string) => {
    // TODO: P-35 - 调用API更新心愿的收藏状态
    setWishesState(prevWishes => 
      prevWishes.map(wish => 
        wish.id === wishId 
          ? { ...wish, isFavorite: !wish.isFavorite }
          : wish
      )
    )
  }

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'flow') {
        if (e.key === 'ArrowDown') {
          setActiveIndex(prev => Math.min(prev + 1, filteredWishes.length - 1))
        } else if (e.key === 'ArrowUp') {
          setActiveIndex(prev => Math.max(prev - 1, 0))
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, filteredWishes.length])

  // 流动视图 - 垂直滚动的沉浸式体验
  const FlowView = () => {
    return (
      <div className="relative">
        {filteredWishes.map((wish, index) => {
          const gradientClass = generateGradient(wish.title)
          
          return (
            <div
              key={wish.id}
              className="relative min-h-screen flex items-center justify-center p-8 snap-start"
              style={wish.imageUrl ? { 
                background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${wish.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.8)'
              } : {}}
            >
              {/* 无图片时的渐变背景 */}
              {!wish.imageUrl && (
                <div className={cn(
                  'absolute inset-0 -z-10 bg-gradient-to-br',
                  gradientClass
                )} />
              )}

              <div className="relative max-w-6xl w-full h-full flex items-center py-16">
                {/* 背景模糊效果 */}
                {wish.imageUrl && (
                  <div 
                    className="absolute inset-0 -z-10"
                    style={{
                      backgroundImage: `url(${wish.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.3) blur(30px)',
                    }}
                  />
                )}

                {/* 内容 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
                  {/* 图片或占位符 */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    key={`${wish.id}-image`}
                    className="relative aspect-[3/4] overflow-hidden rounded-[40px] shadow-2xl"
                  >
                    {wish.imageUrl ? (
                      <img
                        src={wish.imageUrl}
                        alt={wish.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={cn(
                        'w-full h-full flex items-center justify-center',
                        'bg-gradient-to-br', gradientClass
                      )}>
                        <div className="text-center text-white">
                          <Image size={80} className="mx-auto mb-4 opacity-50" />
                          <p className="text-xl opacity-70">暂无图片</p>
                        </div>
                      </div>
                    )}

                    {/* 收藏按钮 */}
                    <button
                      onClick={() => toggleFavorite(wish.id)}
                      className={cn(
                        'absolute top-6 right-6 p-3 rounded-full',
                        'bg-white/20 backdrop-blur-2xl',
                        'hover:bg-white/30 transition-all duration-300',
                        wish.isFavorite && 'bg-apple-red/80 text-white'
                      )}
                      aria-label={wish.isFavorite ? '取消收藏' : '添加到收藏'}
                      title={wish.isFavorite ? '取消收藏' : '添加到收藏'}
                    >
                      <Heart size={20} className={wish.isFavorite ? 'fill-current' : ''} />
                    </button>

                    {/* 标签移到图片左下角 - 毛玻璃效果 */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                      {/* 分类标签 - 毛玻璃效果 */}
                      {wish.category && (
                        <span className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-full',
                          'bg-white/20 backdrop-blur-xl border border-white/30',
                          'text-white shadow-lg'
                        )}>
                          {wish.category}
                        </span>
                      )}
                      
                      {/* 心愿小标签 - 毛玻璃效果，最多显示3个 */}
                      {wish.tags && wish.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {wish.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className={cn(
                                'px-2 py-1 text-xs rounded-full',
                                'bg-black/20 backdrop-blur-xl border border-white/20',
                                'text-white/90'
                              )}
                            >
                              #{tag}
                            </span>
                          ))}
                          {wish.tags.length > 3 && (
                            <span className={cn(
                              'px-2 py-1 text-xs rounded-full',
                              'bg-black/30 backdrop-blur-xl border border-white/20',
                              'text-white/80'
                            )}>
                              +{wish.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* 文字 */}
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    key={`${wish.id}-text`}
                    className="space-y-6 text-white"
                  >
                    <div>
                      <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                        {wish.title}
                      </h1>
                      {wish.description && (
                        <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                          {wish.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 导航提示 */}
              {index < filteredWishes.length - 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    向下滚动
                  </motion.div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // 极简网格视图
  const MinimalView = () => {
    return (
      <div className="h-full overflow-auto p-4 sm:p-8 pb-32"> {/* 增加底部padding避免导航栏遮挡 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
          {filteredWishes.map((wish, index) => {
            const gradientClass = generateGradient(wish.title)
            
            return (
              <motion.div
                key={wish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-apple-gray-100 dark:bg-apple-gray-800 cursor-pointer"
              >
                {wish.imageUrl ? (
                  <img
                    src={wish.imageUrl}
                    alt={wish.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                ) : (
                  <div className={cn(
                    'w-full h-full flex items-center justify-center',
                    'bg-gradient-to-br', gradientClass
                  )}>
                    <Image size={40} className="text-white/30" />
                  </div>
                )}


                
                {/* 悬浮信息 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">
                      {wish.title}
                    </h3>
                  </div>
                </div>

                {/* 极简收藏按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(wish.id)
                  }}
                  className={cn(
                    'absolute top-3 right-3 p-2 rounded-full',
                    'opacity-0 group-hover:opacity-100 transition-all duration-300',
                    wish.isFavorite 
                      ? 'bg-apple-red text-white' 
                      : 'bg-white/80 text-black'
                  )}
                  aria-label={wish.isFavorite ? '取消收藏' : '添加到收藏'}
                  title={wish.isFavorite ? '取消收藏' : '添加到收藏'}
                >
                  <Heart size={14} className={wish.isFavorite ? 'fill-current' : ''} />
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      {/* 主内容区域 */}
      <div 
        ref={containerRef}
        className={cn(
          'h-full',
          viewMode === 'flow' && 'overflow-y-auto snap-y snap-mandatory'
        )}
      >
        {viewMode === 'flow' && <FlowView />}
        {viewMode === 'minimal' && <MinimalView />}
      </div>
    </div>
  )
}