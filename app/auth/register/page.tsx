'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/lib/stores/useToastStore'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Heart, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('密码确认失败', '两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      toast.error('密码太短', '密码至少需要6个字符')
      return
    }

    setIsLoading(true)

    const { data, error } = await signUp(email, password, username)

    if (error) {
      toast.error('注册失败', error.message)
    } else {
      toast.success('注册成功', '请检查你的邮箱并确认账户')
      router.push('/auth/login')
    }

    setIsLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-8 left-8 z-10 p-3 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
        aria-label="返回首页"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center"
            >
              <Heart size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">加入品镜</h1>
            <p className="text-gray-400">创建你的专属账户</p>
          </div>

          {/* 注册表单 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  用户名
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入你的用户名"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  邮箱地址
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入你的邮箱"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  密码
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入你的密码"
                    className="w-full pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">密码至少6个字符</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-white/10 transition-colors"
                    aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password || !confirmPassword}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isLoading ? '注册中...' : '注册账户'}
              </Button>
            </form>

            {/* 登录链接 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                已有账户？{' '}
                <button
                  onClick={() => router.push('/auth/login')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  立即登录
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}