'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Camera, Sparkles, Hash, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/stores/useToastStore'

type Step = 'image' | 'title' | 'details' | 'preview'

export default function AddWishPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>('image')
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/')
      }
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        if (currentStep === 'preview') {
          handleSubmit()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentStep, router])

  const handleSubmit = () => {
    // TODO: P-26 - 调用API创建新心愿
    console.log('提交心愿:', formData)
    toast.success('心愿创建成功', '它现在已经出现在你的心愿清单里了。')
    router.push('/')
  }

  // 步骤导航
  const nextStep = () => {
    const steps: Step[] = ['image', 'title', 'details', 'preview']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Step[] = ['image', 'title', 'details', 'preview']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  // 图片上传步骤
  const ImageStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="h-full flex items-center justify-center p-8"
    >
      <div className="text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Camera size={64} className="mx-auto text-white/50 mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            选择一张图片
          </h2>
          <p className="text-xl text-white/60">
            每个心愿都需要一个视觉印象
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <input
            type="url"
            placeholder="粘贴图片链接..."
            value={formData.imageUrl}
            onChange={(e) => {
              e.preventDefault()
              setFormData({ ...formData, imageUrl: e.target.value })
            }}
            className={cn(
              'w-full px-6 py-4 text-lg',
              'bg-white/10 backdrop-blur-xl rounded-2xl',
              'text-white placeholder:text-white/30',
              'border border-white/20',
              'focus:outline-none focus:border-white/40',
              'transition-all duration-300'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (formData.imageUrl) nextStep()
              }
            }}
          />
          
          {formData.imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-video rounded-2xl overflow-hidden"
            >
              <img
                src={formData.imageUrl}
                alt="预览"
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={(e) => {
            e.preventDefault()
            nextStep()
          }}
          disabled={!formData.imageUrl}
          className={cn(
            'px-8 py-4 rounded-full text-lg font-medium',
            'transition-all duration-300',
            formData.imageUrl
              ? 'bg-white text-black hover:scale-105'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          )}
        >
          下一步
        </motion.button>
      </div>
    </motion.div>
  )

  // 标题输入步骤
  const TitleStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full relative"
    >
      {/* 背景图片 */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${formData.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.3) blur(50px)',
        }}
      />

      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-4xl text-white/60 mb-8"
          >
            给你的心愿起个名字
          </motion.h2>

          <motion.input
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            type="text"
            value={formData.title}
            onChange={(e) => {
              e.preventDefault()
              setFormData({ ...formData, title: e.target.value })
            }}
            placeholder="输入标题..."
            className={cn(
              'w-full text-5xl md:text-7xl font-bold',
              'bg-transparent border-none',
              'text-white placeholder:text-white/20',
              'focus:outline-none',
              'transition-all duration-300'
            )}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (formData.title) nextStep()
              }
            }}
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                prevStep()
              }}
              className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              返回
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                nextStep()
              }}
              disabled={!formData.title}
              className={cn(
                'px-8 py-3 rounded-full font-medium',
                'transition-all duration-300',
                formData.title
                  ? 'bg-white text-black hover:scale-105'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              )}
            >
              继续
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  // 详情输入步骤
  const DetailsStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full overflow-auto"
    >
      <div className="min-h-full bg-black p-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 预览卡片 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative aspect-[16/9] rounded-3xl overflow-hidden"
          >
            <img
              src={formData.imageUrl}
              alt={formData.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h3 className="text-4xl font-bold text-white mb-2">{formData.title}</h3>
            </div>
          </motion.div>

          {/* 描述输入 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <label className="text-white/60 text-lg">描述（可选）</label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                e.preventDefault()
                setFormData({ ...formData, description: e.target.value })
              }}
              placeholder="为什么这是你的心愿..."
              rows={4}
              className={cn(
                'w-full px-6 py-4 text-lg',
                'bg-white/10 backdrop-blur-xl rounded-2xl',
                'text-white placeholder:text-white/30',
                'border border-white/20',
                'focus:outline-none focus:border-white/40',
                'transition-all duration-300 resize-none'
              )}
            />
          </motion.div>

          {/* 分类选择 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <label className="text-white/60 text-lg">分类</label>
            <div className="flex flex-wrap gap-3">
              {['数码科技', '旅行体验', '时尚配饰', '家居装饰', '健康生活'].map(cat => (
                <button
                  key={cat}
                  onClick={(e) => {
                    e.preventDefault()
                    setFormData({ ...formData, category: cat })
                  }}
                  className={cn(
                    'px-6 py-3 rounded-full transition-all duration-300',
                    formData.category === cat
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 优先级 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <label className="text-white/60 text-lg">优先级</label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map(priority => (
                <button
                  key={priority}
                  onClick={(e) => {
                    e.preventDefault()
                    setFormData({ ...formData, priority })
                  }}
                  className={cn(
                    'px-6 py-3 rounded-full transition-all duration-300 capitalize',
                    formData.priority === priority
                      ? priority === 'high' ? 'bg-apple-red text-white' : 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {priority === 'low' ? '低' : priority === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-4 pt-8"
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                prevStep()
              }}
              className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
            >
              返回
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                nextStep()
              }}
              className="px-8 py-3 rounded-full bg-white text-black font-medium hover:scale-105 transition-all duration-300"
            >
              预览
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  // 预览步骤
  const PreviewStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex items-center justify-center p-8"
    >
      <div className="max-w-2xl w-full space-y-8">
        {/* 预览卡片 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
        >
          <img
            src={formData.imageUrl}
            alt={formData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h3 className="text-2xl font-bold mb-2">{formData.title}</h3>
            {formData.description && (
              <p className="text-white/80 line-clamp-2">{formData.description}</p>
            )}
          </div>
          {formData.priority === 'high' && (
            <div className="absolute top-4 left-4 w-3 h-3 bg-apple-red rounded-full animate-pulse" />
          )}
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              prevStep()
            }}
            className="px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-300"
          >
            编辑
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="px-8 py-3 rounded-full bg-apple-blue text-white font-medium hover:scale-105 transition-all duration-300"
          >
            <Sparkles size={20} className="inline mr-2" />
            创建心愿
          </button>
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="h-screen bg-black overflow-hidden">
      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={(e) => {
          e.preventDefault()
          router.push('/')
        }}
        className="fixed top-8 left-8 z-50 p-3 rounded-full bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 transition-all duration-300"
      >
        <ArrowLeft size={20} />
      </motion.button>

      {/* 进度指示器 */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {(['image', 'title', 'details', 'preview'] as Step[]).map((step, index) => (
          <motion.div
            key={step}
            initial={false}
            animate={{
              width: currentStep === step ? 32 : 8,
              opacity: currentStep === step ? 1 : 0.3
            }}
            className="h-2 bg-white rounded-full cursor-pointer"
            onClick={(e) => {
              e.preventDefault()
              setCurrentStep(step)
            }}
          />
        ))}
      </div>

      {/* 步骤内容 */}
      <AnimatePresence mode="wait">
        {currentStep === 'image' && <ImageStep key="image" />}
        {currentStep === 'title' && <TitleStep key="title" />}
        {currentStep === 'details' && <DetailsStep key="details" />}
        {currentStep === 'preview' && <PreviewStep key="preview" />}
      </AnimatePresence>

      {/* 快捷键提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-8 right-8 text-white/30 text-sm"
      >
        <span className="mr-4">ESC 退出</span>
        <span>⌘/Ctrl + Enter 提交</span>
      </motion.div>
    </div>
  )
} 