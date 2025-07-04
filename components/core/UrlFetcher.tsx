'use client'

import React, { useState } from 'react'
import { Globe, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { Button, Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface FetchedContent {
  title: string
  description?: string
  imageUrl?: string
  siteName?: string
  url: string
}

export interface UrlFetcherProps {
  onContentFetched?: (content: FetchedContent) => void
  onError?: (error: string) => void
  className?: string
}

const UrlFetcher = React.forwardRef<HTMLDivElement, UrlFetcherProps>(
  ({ onContentFetched, onError, className }, ref) => {
    const [url, setUrl] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [fetchedContent, setFetchedContent] = useState<FetchedContent | null>(null)
    const [error, setError] = useState<string | null>(null)

    // 模拟URL抓取功能
    const mockFetchContent = async (inputUrl: string): Promise<FetchedContent> => {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

      // 模拟不同网站的抓取结果
      const mockResults: Record<string, FetchedContent> = {
        'apple.com': {
          title: 'Apple MacBook Pro 16" with M3 Max',
          description: '最新的 MacBook Pro，搭载 M3 Max 芯片，为专业创作者提供卓越性能。',
          imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
          siteName: 'Apple',
          url: inputUrl
        },
        'ikea.com': {
          title: 'MÖLLEKULLA 餐桌 - 橡木贴面',
          description: '简约的北欧设计风格，天然橡木材质，适合小户型的温馨用餐空间。',
          imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80',
          siteName: 'IKEA',
          url: inputUrl
        },
        'japan.travel': {
          title: '京都赏樱之旅 - 完美的春天体验',
          description: '探索日本古都京都的樱花之美，从清水寺到哲学之道，感受传统文化的魅力。',
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
          siteName: 'Japan Travel',
          url: inputUrl
        }
      }

      // 根据URL匹配模拟结果
      const domain = Object.keys(mockResults).find(key => inputUrl.includes(key))
      
      if (domain) {
        return mockResults[domain]
      }

      // 默认抓取结果
      return {
        title: '抓取的网页标题',
        description: '这是从网页中提取的描述信息...',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
        siteName: '未知网站',
        url: inputUrl
      }
    }

    const isValidUrl = (urlString: string) => {
      try {
        new URL(urlString)
        return true
      } catch {
        return false
      }
    }

    const handleFetch = async () => {
      if (!url.trim()) {
        setError('请输入有效的链接')
        return
      }

      if (!isValidUrl(url)) {
        setError('请输入有效的URL格式')
        return
      }

      setIsLoading(true)
      setError(null)
      setFetchedContent(null)

      try {
        const content = await mockFetchContent(url)
        setFetchedContent(content)
        onContentFetched?.(content)
      } catch (err) {
        const errorMsg = '抓取失败，请检查链接是否正确'
        setError(errorMsg)
        onError?.(errorMsg)
      } finally {
        setIsLoading(false)
      }
    }

    const handleReset = () => {
      setUrl('')
      setError(null)
      setFetchedContent(null)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleFetch()
      }
    }

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* URL输入区域 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-apple-gray-700 dark:text-apple-gray-300">
            链接地址
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400" />
              <Input
                type="url"
                placeholder="粘贴或输入链接，如：https://www.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleFetch}
              disabled={isLoading || !url.trim()}
              className="px-6"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                '抓取'
              )}
            </Button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-apple-red/10 border border-apple-red/20 rounded-apple text-apple-red">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <Card className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <Loader2 size={20} className="animate-spin text-apple-blue" />
              <span className="text-apple-gray-600">正在抓取内容...</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-apple-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-apple-gray-200 rounded animate-pulse w-3/4" />
            </div>
          </Card>
        )}

        {/* 抓取结果预览 */}
        {fetchedContent && !isLoading && (
          <Card className="overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <CheckCircle size={20} className="text-apple-green mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-apple-green">内容抓取成功</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="text-apple-gray-500 hover:text-apple-gray-700"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    重新抓取
                  </Button>
                </div>
                
                {/* 内容预览 */}
                <div className="border border-apple-gray-200 rounded-apple overflow-hidden">
                  {fetchedContent.imageUrl && (
                    <div className="relative h-32 bg-apple-gray-100">
                      <img
                        src={fetchedContent.imageUrl}
                        alt={fetchedContent.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-apple-gray-900 dark:text-white line-clamp-2">
                      {fetchedContent.title}
                    </h3>
                    
                    {fetchedContent.description && (
                      <p className="text-sm text-apple-gray-600 dark:text-apple-gray-400 line-clamp-2">
                        {fetchedContent.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-apple-gray-500">
                      <span>{fetchedContent.siteName}</span>
                      <span className="truncate max-w-48">{fetchedContent.url}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }
)

UrlFetcher.displayName = 'UrlFetcher'

export { UrlFetcher } 