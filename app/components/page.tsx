'use client'

import React, { useState } from 'react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Input,
  Loading,
  LoadingSkeleton,
  Modal,
  ModalHeader,
  ModalBody, 
  ModalFooter,
  ConfirmModal,
  useDisclosure
} from '@/components/ui'
import { 
  Heart, 
  Search, 
  User, 
  Settings, 
  Download,
  Plus,
  Check,
  X
} from 'lucide-react'

export default function ComponentsPage() {
  const [inputValue, setInputValue] = useState('')
  const [inputError, setInputError] = useState('')
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    if (value.length < 3 && value.length > 0) {
      setInputError('至少需要3个字符')
    } else {
      setInputError('')
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl font-semibold text-apple-gray-950 dark:text-white mb-4">
            Curio UI 组件库
          </h1>
          <p className="text-xl text-apple-gray-600 dark:text-apple-gray-400 max-w-2xl mx-auto">
            基于 Apple Design 打造的 React 组件集合
          </p>
        </section>

        {/* Button Components */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">按钮组件</h2>
          <Card padding="lg">
            <CardHeader>
              <h3 className="text-xl font-medium">Button 变体</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 不同变体 */}
                <div>
                  <h4 className="text-sm font-medium text-apple-gray-500 mb-3">变体</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="success">Success</Button>
                  </div>
                </div>

                {/* 不同尺寸 */}
                <div>
                  <h4 className="text-sm font-medium text-apple-gray-500 mb-3">尺寸</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                {/* 带图标 */}
                <div>
                  <h4 className="text-sm font-medium text-apple-gray-500 mb-3">图标按钮</h4>
                  <div className="flex flex-wrap gap-4">
                    <Button icon={<Heart size={16} />}>收藏</Button>
                    <Button icon={<Download size={16} />} iconPosition="right" variant="secondary">下载</Button>
                    <Button icon={<Plus size={16} />} variant="success">添加</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Components */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">卡片组件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card hoverable>
              <CardHeader>
                <h3 className="font-semibold">基础卡片</h3>
              </CardHeader>
              <CardContent>
                <p className="text-apple-gray-600">这是一个基础的卡片组件，支持悬浮效果。</p>
              </CardContent>
            </Card>

            <Card clickable bordered onClick={() => console.log('卡片被点击')}>
              <CardHeader>
                <h3 className="font-semibold">可点击卡片</h3>
              </CardHeader>
              <CardContent>
                <p className="text-apple-gray-600">这个卡片可以点击，带有边框样式。</p>
              </CardContent>
            </Card>

            <Card shadow="lg">
              <CardHeader>
                <h3 className="font-semibold">阴影卡片</h3>
              </CardHeader>
              <CardContent>
                <p className="text-apple-gray-600">这个卡片有较大的阴影效果。</p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="ghost">了解更多</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Input Components */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">输入组件</h2>
          <Card padding="lg">
            <CardHeader>
              <h3 className="text-xl font-medium">Input 样式</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="用户名"
                    placeholder="请输入用户名"
                    icon={<User size={16} />}
                  />
                  
                  <Input
                    label="搜索"
                    placeholder="搜索内容..."
                    icon={<Search size={16} />}
                    iconPosition="right"
                    variant="flat"
                  />
                  
                  <Input
                    label="验证输入"
                    placeholder="至少3个字符"
                    value={inputValue}
                    onChange={handleInputChange}
                    error={inputError}
                    helperText="请输入至少3个字符"
                  />
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="设置"
                    placeholder="配置项"
                    icon={<Settings size={16} />}
                    variant="underlined"
                  />
                  
                  <Input
                    label="禁用状态"
                    placeholder="不可编辑"
                    disabled
                    value="只读内容"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Loading Components */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">加载组件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="lg">
              <CardHeader>
                <h3 className="text-xl font-medium">加载状态</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-around items-center">
                    <Loading size="sm" label="小号" />
                    <Loading size="md" label="中号" />
                    <Loading size="lg" label="大号" />
                  </div>
                  
                  <div className="flex justify-around items-center">
                    <Loading variant="circular" size="sm" />
                    <Loading variant="dots" size="md" color="success" />
                    <Loading variant="spinner" size="lg" color="danger" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <h3 className="text-xl font-medium">骨架屏</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LoadingSkeleton height={20} width="80%" />
                  <LoadingSkeleton height={16} width="60%" />
                  <LoadingSkeleton height={16} width="40%" />
                  <div className="flex items-center space-x-3">
                    <LoadingSkeleton height={40} width={40} rounded />
                    <div className="space-y-2 flex-1">
                      <LoadingSkeleton height={16} width="70%" />
                      <LoadingSkeleton height={12} width="50%" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modal Components */}
        <section>
          <h2 className="text-3xl font-semibold mb-8">模态框组件</h2>
          <Card padding="lg">
            <CardHeader>
              <h3 className="text-xl font-medium">Modal 演示</h3>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onPress={onOpen}>打开模态框</Button>
                <Button variant="danger" onPress={onConfirmOpen}>确认对话框</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modal 组件 */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
          <ModalHeader>
            <h3>示例模态框</h3>
          </ModalHeader>
          <ModalBody>
            <p>这是一个 Apple 风格的模态框组件，支持优雅的动画效果。</p>
            <div className="mt-4">
              <Input 
                label="在模态框中的输入"
                placeholder="输入一些内容"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onPress={() => onOpenChange()}>
              取消
            </Button>
            <Button onPress={() => onOpenChange()}>
              确定
            </Button>
          </ModalFooter>
        </Modal>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => onConfirmOpenChange()}
          onConfirm={() => {
            console.log('用户确认了操作')
          }}
          title="确认删除"
          message="您确定要删除这个项目吗？此操作不可撤销。"
          confirmText="删除"
          cancelText="取消"
          confirmVariant="danger"
        />
      </div>
    </main>
  )
} 