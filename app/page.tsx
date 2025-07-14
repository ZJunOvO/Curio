'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, Heart, Grid3X3, Layers3, Calendar, Image, X, Eye, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn, generateGradient } from '@/lib/utils'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useAuth } from '@/hooks/useAuth'
import { getUserWishes, updateWish, type Wish } from '@/lib/supabase/database'
import { toast } from '@/lib/stores/useToastStore'
import { HomePageSkeleton } from '@/components/ui/Skeleton'

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  // 使用全局UI状态
  const { viewMode, showFavorites, setViewMode } = useUIStore()
  
  const [activeIndex, setActiveIndex] = useState(0)
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: containerRef })

  // 加载心愿数据
  useEffect(() => {
    if (user) {
      loadWishes()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadWishes = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const userWishes = await getUserWishes(user.id)
      setWishes(userWishes)
    } catch (error) {
      console.error('Error loading wishes:', error)
      toast.error('加载失败', '无法加载心愿数据')
    } finally {
      setLoading(false)
    }
  }

  const filteredWishes = showFavorites 
    ? wishes.filter(w => w.is_favorite)
    : wishes

  // 切换收藏状态
  const toggleFavorite = async (wishId: string) => {
    if (!user) return

    try {
      const wish = wishes.find(w => w.id === wishId)
      if (!wish) return

      const updatedWish = await updateWish(wishId, { 
        is_favorite: !wish.is_favorite 
      })

      setWishes(prevWishes => 
        prevWishes.map(w => 
          w.id === wishId ? updatedWish : w
        )
      )

      toast.success(
        updatedWish.is_favorite ? '已收藏' : '已取消收藏',
        updatedWish.is_favorite ? '添加到我的收藏' : '从收藏中移除'
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('操作失败', '无法更新收藏状态')
    }
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

  // 如果未认证，显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="relative h-screen overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 h-full flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center">
              <Heart size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">欢迎来到品镜</h1>
            <p className="text-gray-400 mb-8 text-lg">
              管理你的心愿与灵感，探索内在品味的第二大脑
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105"
              >
                <LogIn size={20} />
                登录账户
              </button>
              <button
                onClick={() => router.push('/auth/register')}
                className="w-full px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold transition-all duration-300 backdrop-blur-2xl border border-white/20"
              >
                创建新账户
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // 加载状态
  if (loading || authLoading) {
    return <HomePageSkeleton />;
  }

  // 流动视图 - 垂直滚动的沉浸式体验
  const FlowView = () => {
    if (filteredWishes.length === 0) {
      return (
        <div className="h-screen flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <Image size={80} className="mx-auto mb-6 text-white/30" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {showFavorites ? '还没有收藏的心愿' : '还没有心愿'}
            </h3>
            <p className="text-gray-400 mb-8">
              {showFavorites 
                ? '收藏一些心愿，让它们在这里闪闪发光' 
                : '开始记录你的第一个心愿吧'}
            </p>
            <button
              onClick={() => router.push('/add-wish')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              添加心愿
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="relative">
        {filteredWishes.map((wish, index) => {
          const gradientClass = generateGradient(wish.title)
          
          return (
            <div
              key={wish.id}
              className="relative min-h-screen flex items-center justify-center p-8 snap-start"
              style={wish.image_url ? { 
                background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${wish.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.8)'
              } : {}}
            >
              {/* 无图片时的渐变背景 */}
              {!wish.image_url && (
                <div className={cn(
                  'absolute inset-0 -z-10 bg-gradient-to-br',
                  gradientClass
                )} />
              )}

              <div className="relative max-w-6xl w-full h-full flex items-center py-16">
                {/* 背景模糊效果 */}
                {wish.image_url && (
                  <div 
                    className="absolute inset-0 -z-10"
                    style={{
                      backgroundImage: `url(${wish.image_url})`,
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
                    {wish.image_url ? (
                      <img
                        src={wish.image_url}
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
                        wish.is_favorite && 'bg-apple-red/80 text-white'
                      )}
                      aria-label={wish.is_favorite ? '取消收藏' : '添加到收藏'}
                      title={wish.is_favorite ? '取消收藏' : '添加到收藏'}
                    >
                      <Heart size={20} className={wish.is_favorite ? 'fill-current' : ''} />
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
    if (filteredWishes.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <Image size={80} className="mx-auto mb-6 text-white/30" />
            <h3 className="text-2xl font-bold text-white mb-4">
              {showFavorites ? '还没有收藏的心愿' : '还没有心愿'}
            </h3>
            <p className="text-gray-400 mb-8">
              {showFavorites 
                ? '收藏一些心愿，让它们在这里闪闪发光' 
                : '开始记录你的第一个心愿吧'}
            </p>
            <button
              onClick={() => router.push('/add-wish')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              添加心愿
            </button>
          </div>
        </div>
      )
    }

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
                {wish.image_url ? (
                  <img
                    src={wish.image_url}
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
                    wish.is_favorite 
                      ? 'bg-apple-red text-white' 
                      : 'bg-white/80 text-black'
                  )}
                  aria-label={wish.is_favorite ? '取消收藏' : '添加到收藏'}
                  title={wish.is_favorite ? '取消收藏' : '添加到收藏'}
                >
                  <Heart size={14} className={wish.is_favorite ? 'fill-current' : ''} />
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
      {/* 视图切换器 - 悬浮在页面中上部 */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40">
        <div className="flex gap-1 bg-white/10 backdrop-blur-2xl rounded-2xl p-1 border border-white/20 shadow-2xl">
          <button
            onClick={() => setViewMode('flow')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
              'hover:scale-105 active:scale-95',
              viewMode === 'flow' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            aria-label="流动视图"
          >
            <Eye size={16} />
            <span className="hidden sm:inline text-sm font-medium">流动</span>
          </button>
          <button
            onClick={() => setViewMode('minimal')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
              'hover:scale-105 active:scale-95',
              viewMode === 'minimal' 
                ? 'bg-white/20 text-white shadow-lg' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
            )}
            aria-label="极简视图"
          >
            <Grid3X3 size={16} />
            <span className="hidden sm:inline text-sm font-medium">极简</span>
          </button>
        </div>
      </div>

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