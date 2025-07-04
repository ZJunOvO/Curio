'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Heart, ChevronLeft, ChevronRight, Sparkles, Grid, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { WishItem } from './WishCard'

export interface WishGalleryProps {
  wishes: WishItem[]
  onToggleFavorite?: (id: string) => void
  onOpenWish?: (wish: WishItem) => void
}

type ViewMode = 'gallery' | 'stack' | 'grid'

export const WishGallery: React.FC<WishGalleryProps> = ({
  wishes,
  onToggleFavorite,
  onOpenWish
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')
  const [touchStart, setTouchStart] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentWish = wishes[currentIndex]

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'gallery') return
      
      if (e.key === 'ArrowLeft') navigatePrevious()
      if (e.key === 'ArrowRight') navigateNext()
      if (e.key === ' ') {
        e.preventDefault()
        handleFavoriteToggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, viewMode])

  const navigateNext = () => {
    setCurrentIndex((prev) => (prev + 1) % wishes.length)
  }

  const navigatePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + wishes.length) % wishes.length)
  }

  const handleFavoriteToggle = () => {
    if (currentWish && onToggleFavorite) {
      onToggleFavorite(currentWish.id)
    }
  }

  // 触摸滑动
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) navigateNext()
      else navigatePrevious()
    }
  }

  // 画廊视图 - 沉浸式单卡片展示
  const GalleryView = () => (
    <div 
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWish.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full flex items-center justify-center p-8"
        >
          {/* 背景模糊效果 */}
          <div 
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `url(${currentWish.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(100px) brightness(0.5)',
              transform: 'scale(1.2)'
            }}
          />

          {/* 主要内容 */}
          <div className="relative max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 图片区域 */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl"
            >
              <img
                src={currentWish.imageUrl}
                alt={currentWish.title}
                className="w-full h-full object-cover"
              />
              
              {/* 收藏按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFavoriteToggle}
                className={cn(
                  'absolute top-6 right-6 p-4 rounded-full',
                  'backdrop-blur-xl border border-white/20',
                  'transition-all duration-300 shadow-2xl',
                  currentWish.isFavorite
                    ? 'bg-apple-red text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                <Heart 
                  size={24} 
                  className={currentWish.isFavorite ? 'fill-current' : ''}
                />
              </motion.button>
            </motion.div>

            {/* 文字内容 */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 text-white"
            >
              {/* 分类 */}
              {currentWish.category && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-block"
                >
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-sm font-medium">
                    {currentWish.category}
                  </span>
                </motion.div>
              )}

              {/* 标题 */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl lg:text-6xl font-bold leading-tight"
              >
                {currentWish.title}
              </motion.h1>

              {/* 描述 */}
              {currentWish.description && (
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg lg:text-xl opacity-90 leading-relaxed"
                >
                  {currentWish.description}
                </motion.p>
              )}

              {/* 操作按钮 */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-4 pt-4"
              >
                <button
                  onClick={() => onOpenWish?.(currentWish)}
                  className={cn(
                    'px-8 py-4 bg-white text-black rounded-full',
                    'font-medium hover:scale-105 transition-transform',
                    'shadow-2xl'
                  )}
                >
                  查看详情
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* 导航按钮 */}
          <button
            onClick={navigatePrevious}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 p-4',
              'bg-white/10 backdrop-blur-xl rounded-full',
              'hover:bg-white/20 transition-all duration-300',
              'border border-white/20 shadow-2xl'
            )}
          >
            <ChevronLeft size={24} className="text-white" />
          </button>

          <button
            onClick={navigateNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 p-4',
              'bg-white/10 backdrop-blur-xl rounded-full',
              'hover:bg-white/20 transition-all duration-300',
              'border border-white/20 shadow-2xl'
            )}
          >
            <ChevronRight size={24} className="text-white" />
          </button>

          {/* 进度指示器 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {wishes.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  width: index === currentIndex ? 32 : 8,
                  opacity: index === currentIndex ? 1 : 0.5
                }}
                className={cn(
                  'h-2 bg-white rounded-full transition-all duration-300',
                  'cursor-pointer hover:opacity-75'
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )

  // 堆叠视图 - 3D卡片堆叠效果
  const StackView = () => (
    <div className="relative h-full w-full flex items-center justify-center p-8 overflow-hidden">
      <div className="relative w-full max-w-md">
        {wishes.slice(0, 5).map((wish, index) => (
          <motion.div
            key={wish.id}
            initial={{ scale: 0.8, y: 100, opacity: 0 }}
            animate={{
              scale: 1 - index * 0.05,
              y: index * 15,
              opacity: 1 - index * 0.2,
              rotateZ: (index - 2) * 5
            }}
            transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              zIndex: wishes.length - index,
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)'
            }}
            className="w-full cursor-pointer"
            onClick={() => {
              setCurrentIndex(index)
              setViewMode('gallery')
            }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-2xl bg-white dark:bg-apple-gray-900">
              <img
                src={wish.imageUrl}
                alt={wish.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{wish.title}</h3>
                {wish.category && (
                  <span className="text-sm opacity-80">{wish.category}</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  // 网格视图 - 创新的六边形网格
  const GridView = () => (
    <div className="h-full w-full overflow-auto p-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {wishes.map((wish, index) => (
          <motion.div
            key={wish.id}
            initial={{ scale: 0, rotateZ: -180 }}
            animate={{ scale: 1, rotateZ: 0 }}
            transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="relative aspect-square cursor-pointer group"
            onClick={() => {
              setCurrentIndex(index)
              setViewMode('gallery')
            }}
          >
            <div className="relative w-full h-full overflow-hidden rounded-3xl shadow-lg">
              <img
                src={wish.imageUrl}
                alt={wish.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-lg font-semibold line-clamp-2">{wish.title}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-black">
      {/* 视图切换器 */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        <button
          onClick={() => setViewMode('gallery')}
          className={cn(
            'p-3 rounded-full backdrop-blur-xl border border-white/20',
            'transition-all duration-300',
            viewMode === 'gallery'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Sparkles size={20} />
        </button>
        <button
          onClick={() => setViewMode('stack')}
          className={cn(
            'p-3 rounded-full backdrop-blur-xl border border-white/20',
            'transition-all duration-300',
            viewMode === 'stack'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Layers size={20} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={cn(
            'p-3 rounded-full backdrop-blur-xl border border-white/20',
            'transition-all duration-300',
            viewMode === 'grid'
              ? 'bg-white text-black'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          <Grid size={20} />
        </button>
      </div>

      {/* 根据模式渲染不同视图 */}
      <AnimatePresence mode="wait">
        {viewMode === 'gallery' && <GalleryView />}
        {viewMode === 'stack' && <StackView />}
        {viewMode === 'grid' && <GridView />}
      </AnimatePresence>
    </div>
  )
} 