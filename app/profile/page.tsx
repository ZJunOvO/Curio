'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/lib/stores/useToastStore'
import { cn } from '@/lib/utils'
import { User, Mail, Heart, Users, ArrowLeft, Settings, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import { getUserProfile, getUserBindings, getPendingBindings, updateUserProfile, createBinding, respondToBinding, type UserProfile, type Binding } from '@/lib/supabase/database'
import { ProfilePageSkeleton } from '@/components/ui/Skeleton'

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bindings, setBindings] = useState<Binding[]>([])
  const [pendingBindings, setPendingBindings] = useState<Binding[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', avatar_url: '' })
  const [bindingEmail, setBindingEmail] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isBinding, setIsBinding] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // 加载用户资料
      const userProfile = await getUserProfile(user.id)
      if (userProfile) {
        setProfile(userProfile)
        setEditForm({
          username: userProfile.username || '',
          avatar_url: userProfile.avatar_url || ''
        })
      }

      // 加载绑定关系
      const userBindings = await getUserBindings(user.id)
      setBindings(userBindings)

      // 加载待处理的邀请
      const pendingInvites = await getPendingBindings(user.id)
      setPendingBindings(pendingInvites)
    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('加载失败', '无法加载用户数据')
    }
  }

  const handleUpdateProfile = async () => {
    if (!user || !profile) return

    setIsUpdating(true)
    try {
      await updateUserProfile(user.id, editForm)
      setProfile({ ...profile, ...editForm })
      setIsEditing(false)
      toast.success('更新成功', '个人资料已更新')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('更新失败', '无法更新个人资料')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCreateBinding = async () => {
    if (!user || !bindingEmail.trim()) return

    setIsBinding(true)
    try {
      await createBinding(user.id, bindingEmail, 'couple')
      setBindingEmail('')
      toast.success('绑定请求已发送', '等待对方确认')
      loadUserData() // 重新加载数据
    } catch (error: any) {
      console.error('Error creating binding:', error)
      toast.error('绑定失败', error.message || '无法创建绑定关系')
    } finally {
      setIsBinding(false)
    }
  }

  const handleRespondToBinding = async (bindingId: string, response: 'accepted' | 'rejected') => {
    try {
      await respondToBinding(bindingId, response)
      toast.success(
        response === 'accepted' ? '已接受邀请' : '已拒绝邀请',
        response === 'accepted' ? '你们现在是绑定伙伴了' : '邀请已被拒绝'
      )
      loadUserData() // 重新加载数据
    } catch (error) {
      console.error('Error responding to binding:', error)
      toast.error('操作失败', '无法处理邀请')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('已退出登录', '期待你的再次使用')
      router.push('/')
    } catch (error) {
      toast.error('退出失败', '请重试')
    }
  }

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!user) {
    router.push('/auth/login')
    return null
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

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-4xl mx-auto pt-20">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">个人中心</h1>
            <p className="text-gray-400">管理你的账户和绑定关系</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 个人资料卡片 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <User size={24} />
                  个人资料
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label={isEditing ? '取消编辑' : '编辑资料'}
                >
                  <Settings size={18} />
                </button>
              </div>

              {profile && (
                <div className="space-y-6">
                  {/* 头像 */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="头像" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {profile.username || '未设置用户名'}
                      </h3>
                      <p className="text-gray-400 flex items-center gap-2">
                        <Mail size={16} />
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {/* 编辑表单 */}
                  {isEditing && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">用户名</label>
                        <Input
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          placeholder="输入用户名"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">头像链接</label>
                        <Input
                          value={editForm.avatar_url}
                          onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                          placeholder="输入头像图片链接"
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="flex-1 bg-blue-500 hover:bg-blue-600"
                        >
                          {isUpdating ? '更新中...' : '保存'}
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="ghost"
                          className="flex-1"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 账户信息 */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">
                      注册时间：{new Date(profile.created_at).toLocaleDateString('zh-CN')}
                    </p>
                    <p className="text-sm text-gray-400">
                      最后更新：{new Date(profile.updated_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* 绑定关系卡片 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                <Heart size={24} />
                绑定关系
              </h2>

              {/* 待处理的邀请 */}
              {pendingBindings.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold text-orange-400 flex items-center gap-2">
                    <Mail size={16} />
                    待处理邀请 ({pendingBindings.length})
                  </h3>
                  {pendingBindings.map((binding) => {
                    const inviter = binding.user1
                    return (
                      <div key={binding.id} className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                            {inviter.avatar_url ? (
                              <img 
                                src={inviter.avatar_url} 
                                alt="邀请者头像" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{inviter.username || '未设置用户名'}</h4>
                            <p className="text-sm text-gray-400">{inviter.email}</p>
                            <p className="text-xs text-orange-400 mt-1">
                              邀请你成为{binding.relationship_type === 'couple' ? '情侣' : 
                                       binding.relationship_type === 'family' ? '家人' : '朋友'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespondToBinding(binding.id, 'rejected')}
                              className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                            >
                              拒绝
                            </button>
                            <button
                              onClick={() => handleRespondToBinding(binding.id, 'accepted')}
                              className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                            >
                              接受
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 当前绑定 */}
              <div className="space-y-4 mb-6">
                {bindings.length > 0 ? (
                  bindings.map((binding) => {
                    const partner = binding.user1_id === user.id ? binding.user2 : binding.user1
                    return (
                      <div key={binding.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                            {partner.avatar_url ? (
                              <img 
                                src={partner.avatar_url} 
                                alt="伙伴头像" 
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users size={20} className="text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{partner.username || '未设置用户名'}</h4>
                            <p className="text-sm text-gray-400">{partner.email}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                              {binding.relationship_type === 'couple' ? '情侣' : 
                               binding.relationship_type === 'family' ? '家人' : '朋友'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Heart size={48} className="mx-auto mb-4 opacity-50" />
                    <p>还没有绑定伙伴</p>
                    <p className="text-sm">添加伙伴来一起使用品镜</p>
                  </div>
                )}
              </div>

              {/* 添加绑定 */}
              <div className="space-y-4">
                <h3 className="font-semibold">添加新伙伴</h3>
                <div className="flex gap-3">
                  <Input
                    value={bindingEmail}
                    onChange={(e) => setBindingEmail(e.target.value)}
                    placeholder="输入伙伴的邮箱地址"
                    className="flex-1"
                    type="email"
                  />
                  <Button
                    onClick={handleCreateBinding}
                    disabled={isBinding || !bindingEmail.trim()}
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    {isBinding ? '发送中...' : '绑定'}
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  发送绑定请求后，对方需要登录确认才能生效
                </p>
              </div>
            </motion.div>
          </div>

          {/* 退出登录按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="flex items-center gap-2 mx-auto border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={18} />
              退出登录
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}