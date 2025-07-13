'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TodoList } from '@/components/core/TodoList'
import { FinanceTracker } from '@/components/core/FinanceTracker'
import { StatsDashboard } from '@/components/core/StatsDashboard'
import { useAuth } from '@/hooks/useAuth'
import { 
  getUserBindings, 
  getTodoItems, 
  getFinanceRecords,
  type Binding,
  type TodoItem as DBTodoItem,
  type FinanceRecord as DBFinanceRecord
} from '@/lib/supabase/database'
import { toast } from '@/lib/stores/useToastStore'
import { Heart, Users, Sparkles, TrendingUp, Calendar, Settings, Plus, DollarSign, TrendingDown, CheckCircle, Clock, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Gift, Search, PieChart, LogIn, Link } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TogetherPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [activeTab, setActiveTab] = useState<'finance' | 'todo'>('finance')
  const [loading, setLoading] = useState(true)
  
  // 数据状态
  const [bindings, setBindings] = useState<any[]>([])
  const [todos, setTodos] = useState<DBTodoItem[]>([])
  const [financeRecords, setFinanceRecords] = useState<DBFinanceRecord[]>([])
  
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)
  const scrollDirection = useRef<'up' | 'down' | null>(null)

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest
    const previousScrollY = lastScrollY.current
    
    if (currentScrollY > previousScrollY) {
      scrollDirection.current = 'down'
    } else if (currentScrollY < previousScrollY) {
      scrollDirection.current = 'up'
    }
    
    const SHOW_THRESHOLD = 60
    const HIDE_THRESHOLD = 200
    
    if (currentScrollY < SHOW_THRESHOLD && scrollDirection.current === 'up' && !isHeaderVisible) {
      setIsHeaderVisible(true)
    } else if (currentScrollY > HIDE_THRESHOLD && scrollDirection.current === 'down' && isHeaderVisible) {
      setIsHeaderVisible(false)
    }
    
    lastScrollY.current = currentScrollY
  })

  // 加载数据
  useEffect(() => {
    if (user) {
      loadTogetherData()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadTogetherData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // 加载绑定关系
      const userBindings = await getUserBindings(user.id)
      setBindings(userBindings)
      
      // 如果有绑定关系，加载共享数据
      if (userBindings.length > 0) {
        const activeBinding = userBindings[0] // 取第一个活跃的绑定关系
        
        // 加载待办事项
        const bindingTodos = await getTodoItems(user.id, activeBinding.id)
        setTodos(bindingTodos)
        
        // 加载财务记录
        const bindingFinanceRecords = await getFinanceRecords(user.id, activeBinding.id)
        setFinanceRecords(bindingFinanceRecords)
      } else {
        // 如果没有绑定关系，加载个人数据
        const personalTodos = await getTodoItems(user.id)
        setTodos(personalTodos)
        
        const personalFinanceRecords = await getFinanceRecords(user.id)
        setFinanceRecords(personalFinanceRecords)
      }
    } catch (error) {
      console.error('Error loading together data:', error)
      toast.error('加载失败', '无法加载Together数据')
    } finally {
      setLoading(false)
    }
  }

  // 如果未认证，显示登录提示
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-black to-purple-900/20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl flex items-center justify-center">
              <Heart size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Together</h1>
            <p className="text-gray-400 mb-8 text-lg">
              登录后与伙伴一起管理生活
            </p>
            <div className="space-y-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-2xl text-white font-semibold transition-all duration-300 hover:scale-105"
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
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  // 获取活跃的绑定关系
  const activeBinding = bindings.length > 0 ? bindings[0] : null
  const boundUser = activeBinding ? 
    (activeBinding.user1_id === user.id ? activeBinding.user2 : activeBinding.user1) : null

  // 计算统计数据
  const totalIncome = financeRecords
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0)
  
  const totalExpense = financeRecords
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + Math.abs(r.amount), 0)
  
  const monthlyExpense = financeRecords
    .filter(r => r.type === 'expense' && 
      new Date(r.date).getMonth() === new Date().getMonth())
    .reduce((sum, r) => sum + Math.abs(r.amount), 0)

  // 待办事项统计
  const completedTodos = todos.filter(t => t.completed).length
  const totalTodos = todos.length
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-black to-purple-900/20" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      {/* 页面内容 */}
      <div className="relative z-10">
        {/* 英雄区域 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative pt-20 pb-12 px-6"
        >
          <div className="max-w-6xl mx-auto text-center">
            {/* 标题和状态 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center"
              >
                <Heart size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Together</h1>
                <div className="flex items-center gap-2 text-gray-400">
                  {activeBinding ? (
                    <>
                      <Users size={16} />
                      <span>与 {boundUser?.username || '伙伴'} 一起</span>
                    </>
                  ) : (
                    <>
                      <Link size={16} />
                      <span>还没有绑定伙伴</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 如果没有绑定关系，显示绑定提示 */}
            {!activeBinding && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 mb-8 border border-white/10 max-w-md mx-auto"
              >
                <h3 className="text-lg font-semibold mb-2">开始与伙伴协作</h3>
                <p className="text-gray-400 text-sm mb-4">
                  前往个人中心绑定你的伙伴，一起管理待办事项和财务记录
                </p>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg text-white font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
                >
                  去绑定伙伴
                </button>
              </motion.div>
            )}

            {/* 快速统计 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">总收入</p>
                    <p className="text-lg font-bold text-green-400">¥{totalIncome.toFixed(2)}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">总支出</p>
                    <p className="text-lg font-bold text-red-400">¥{totalExpense.toFixed(2)}</p>
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-red-400" />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">本月支出</p>
                    <p className="text-lg font-bold text-yellow-400">¥{monthlyExpense.toFixed(2)}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-2xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">完成率</p>
                    <p className="text-lg font-bold text-blue-400">{completionRate}%</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 标签栏 */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('finance')}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2',
                  activeTab === 'finance' 
                    ? 'text-white border-pink-500' 
                    : 'text-gray-400 hover:text-white border-transparent'
                )}
              >
                <Wallet size={16} />
                财务记录
              </button>
              <button
                onClick={() => setActiveTab('todo')}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-300 border-b-2',
                  activeTab === 'todo' 
                    ? 'text-white border-purple-500' 
                    : 'text-gray-400 hover:text-white border-transparent'
                )}
              >
                <CheckCircle size={16} />
                待办事项
              </button>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'finance' && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <FinanceTracker />
              </motion.div>
            )}
            
            {activeTab === 'todo' && (
              <motion.div
                key="todo"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TodoList />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}