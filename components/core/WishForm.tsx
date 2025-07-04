'use client'

import React, { useState, useRef } from 'react'
import { Image as ImageIcon, Tag, Folder, Star, Upload, X, Plus } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
// TODO: P-26 - 如果分类需要动态获取，则从API获取替换这里的mock数据
import { wishCategories } from '@/lib/mock-data'
import { toast } from '@/lib/stores/useToastStore'
import { cn } from '@/lib/utils'

export interface WishFormData {
  title: string
  description?: string
  imageUrl?: string
  imageFile?: File
  tags: string[]
  category?: string
  priority: 'low' | 'medium' | 'high'
  sourceUrl?: string
}

export interface WishFormProps {
  initialData?: Partial<WishFormData>
  onSubmit?: (data: WishFormData) => void
  onDraft?: (data: WishFormData) => void
  className?: string
}

const WishForm = React.forwardRef<HTMLFormElement, WishFormProps>(
  ({ initialData, onSubmit, onDraft, className }, ref) => {
    const [formData, setFormData] = useState<WishFormData>({
      title: '',
      description: '',
      imageUrl: '',
      tags: [],
      category: '',
      priority: 'medium',
      sourceUrl: '',
      ...initialData
    })

    const [currentTag, setCurrentTag] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(
      initialData?.imageUrl || null
    )
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleInputChange = (field: keyof WishFormData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setImagePreview(result)
          setFormData(prev => ({ 
            ...prev, 
            imageFile: file,
            imageUrl: '' // 清除URL，使用文件
          }))
        }
        reader.readAsDataURL(file)
      }
    }

    const handleImageUrlChange = (url: string) => {
      setImagePreview(url)
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: url,
        imageFile: undefined // 清除文件，使用URL
      }))
    }

    const addTag = () => {
      const tag = currentTag.trim()
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }))
        setCurrentTag('')
      }
    }

    const removeTag = (tagToRemove: string) => {
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.filter(tag => tag !== tagToRemove)
      }))
    }

    const handleTagKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      }
    }

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      try {
        onSubmit?.(formData)
        toast.success(
          '心愿创建成功！',
          '你的心愿已经保存到品镜中，可以在主页查看。',
          {
            action: {
              label: '返回主页',
              onClick: () => window.location.href = '/'
            }
          }
        )
      } catch (error) {
        toast.error(
          '创建失败',
          '心愿创建过程中出现错误，请稍后重试。'
        )
      }
    }

    const handleSaveDraft = () => {
      try {
        onDraft?.(formData)
        toast.info(
          '草稿已保存',
          '你的心愿草稿已自动保存，可以稍后继续编辑。'
        )
      } catch (error) {
        toast.error(
          '保存失败',
          '草稿保存过程中出现错误，请检查网络连接。'
        )
      }
    }

    const isFormValid = formData.title.trim().length > 0

    const priorityOptions = [
      { value: 'low', label: '低优先级', color: 'text-apple-gray-600' },
      { value: 'medium', label: '中优先级', color: 'text-apple-blue' },
      { value: 'high', label: '高优先级', color: 'text-apple-red' }
    ] as const

    return (
      <form ref={ref} onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {/* 标题 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            心愿标题 <span className="text-apple-red">*</span>
          </label>
          <Input
            type="text"
            placeholder="输入你的心愿标题..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
          />
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            描述
          </label>
          <textarea
            placeholder="详细描述你的心愿..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={cn(
              'w-full px-3 py-2 border border-apple-gray-300 rounded-apple',
              'focus:ring-2 focus:ring-apple-blue focus:border-apple-blue',
              'dark:bg-apple-gray-800 dark:border-apple-gray-600',
              'resize-none h-24'
            )}
          />
        </div>

        {/* 图片 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            图片
          </label>
          
          {/* 图片预览 */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="预览"
                className="w-full h-48 object-cover rounded-apple"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setImagePreview(null)
                  setFormData(prev => ({ 
                    ...prev, 
                    imageUrl: '',
                    imageFile: undefined 
                  }))
                }}
                className="absolute top-2 right-2"
              >
                <X size={14} />
              </Button>
            </div>
          )}

          {!imagePreview && (
            <div className="space-y-3">
              {/* URL输入 */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400" />
                  <Input
                    type="url"
                    placeholder="图片链接地址"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 文件上传 */}
              <div className="text-center">
                <span className="text-sm text-apple-gray-500">或</span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-2"
                >
                  <Upload size={16} className="mr-2" />
                  上传图片
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  aria-label="上传图片"
                />
              </div>
            </div>
          )}
        </div>

        {/* 分类和优先级 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 分类 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
              分类
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={cn(
                'w-full p-3 rounded-lg bg-apple-gray-100 dark:bg-apple-gray-800',
                'appearance-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue'
              )}
              aria-label="选择分类"
            >
              <option value="">请选择分类</option>
              {wishCategories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 优先级 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
              优先级
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value as 'low' | 'medium' | 'high')}
              className={cn(
                'w-full p-3 rounded-lg bg-apple-gray-100 dark:bg-apple-gray-800',
                'appearance-none focus:ring-2 focus:ring-apple-blue focus:border-apple-blue'
              )}
              aria-label="选择优先级"
            >
              <option value="low">普通</option>
              <option value="medium">优先</option>
              <option value="high">非常重要</option>
            </select>
          </div>
        </div>

        {/* 标签 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            标签
          </label>
          
          {/* 标签列表 */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-sm"
                >
                  <Tag size={12} />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-apple-red"
                    aria-label="移除标签"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 添加标签 */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="添加标签..."
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={addTag}
              disabled={!currentTag.trim()}
              variant="secondary"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* 原始链接 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            原始链接 (可选)
          </label>
          <Input
            type="url"
            placeholder="https://..."
            value={formData.sourceUrl}
            onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!isFormValid}
            className="flex-1"
          >
            创建心愿
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            className="flex-1"
          >
            保存草稿
          </Button>
        </div>
      </form>
    )
  }
)

WishForm.displayName = 'WishForm'

export { WishForm } 