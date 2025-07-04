'use client'

import React from 'react'
import { Layout } from '@/components/layout'
import { Card, CardHeader, CardContent, Button } from '@/components/ui'
import { 
  Heart, 
  Star, 
  Calendar, 
  Users, 
  Zap,
  TrendingUp,
  ArrowRight 
} from 'lucide-react'

export default function LayoutDemoPage() {
  const features = [
    {
      icon: Heart,
      title: '心愿管理',
      description: '记录并整理你的各种心愿，从小愿望到人生目标',
      color: 'text-apple-red'
    },
    {
      icon: Star,
      title: '灵感收集',
      description: '收集并分类你的灵感来源，构建个人品味体系',
      color: 'text-apple-yellow'
    },
    {
      icon: Calendar,
      title: '计划制定',
      description: '制定实现心愿的具体计划和时间安排',
      color: 'text-apple-blue'
    },
    {
      icon: Users,
      title: '协同分享',
      description: '与朋友分享心愿，获得支持和建议',
      color: 'text-apple-green'
    }
  ]

  return (
    <Layout containerized={false}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-apple-blue/5 via-apple-purple/5 to-apple-pink/5 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-apple-gray-900 dark:text-white mb-6">
              探索内在品味的
              <span className="bg-gradient-to-r from-apple-blue to-apple-purple bg-clip-text text-transparent">
                第二大脑
              </span>
            </h1>
            <p className="text-xl text-apple-gray-600 dark:text-apple-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              品镜 Curio 帮助你管理个人欲望、收集灵感、制定计划
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-apple-blue text-white hover:bg-apple-blue/90"
              >
                开始体验
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-apple-gray-25 dark:bg-apple-gray-975">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-apple-gray-900 dark:text-white mb-4">
              核心功能
            </h2>
            <p className="text-lg text-apple-gray-600 dark:text-apple-gray-300 max-w-2xl mx-auto">
              一站式心愿管理平台，让每个想法都有归属
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon
              return (
                <Card 
                  key={feature.title}
                  hoverable
                  className="h-full"
                >
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-apple-lg bg-apple-gray-50 dark:bg-apple-gray-900 flex items-center justify-center mb-4 ${feature.color}`}>
                      <IconComponent size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-apple-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-apple-gray-600 dark:text-apple-gray-300">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    </Layout>
  )
} 