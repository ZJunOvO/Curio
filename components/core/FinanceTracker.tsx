'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  getFinanceRecords,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  getUserBindings,
  type FinanceRecord
} from '@/lib/supabase/database'
import { toast } from '@/lib/stores/useToastStore'
import { cn } from '@/lib/utils'
import { 
  Coffee, Car, Gamepad2, ShoppingBag, Dumbbell, Home, GraduationCap, MoreHorizontal, 
  TrendingUp, DollarSign, Calendar, Tag, User, Clock, CheckCircle, Edit, Search, 
  Trash2, Plus, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  '餐饮': <Coffee className="w-4 h-4" />,
  '交通': <Car className="w-4 h-4" />,
  '娱乐': <Gamepad2 className="w-4 h-4" />,
  '购物': <ShoppingBag className="w-4 h-4" />,
  '健康': <Dumbbell className="w-4 h-4" />,
  '住房': <Home className="w-4 h-4" />,
  '教育': <GraduationCap className="w-4 h-4" />,
  '工资': <TrendingUp className="w-4 h-4" />,
  '其他': <MoreHorizontal className="w-4 h-4" />
}

const categoryColors: Record<string, string> = {
  '餐饮': 'bg-orange-500/20 text-orange-400',
  '交通': 'bg-blue-500/20 text-blue-400',
  '娱乐': 'bg-purple-500/20 text-purple-400',
  '购物': 'bg-pink-500/20 text-pink-400',
  '健康': 'bg-green-500/20 text-green-400',
  '住房': 'bg-yellow-500/20 text-yellow-400',
  '教育': 'bg-indigo-500/20 text-indigo-400',
  '工资': 'bg-emerald-500/20 text-emerald-400',
  '其他': 'bg-gray-500/20 text-gray-400'
}

const FinanceTracker = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    const { user } = useAuth()
    const [records, setRecords] = useState<FinanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [activeBinding, setActiveBinding] = useState<any>(null)
    
    // 筛选和搜索状态
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    
    // 新增记录状态
    const [isAddingRecord, setIsAddingRecord] = useState(false)
    const [newRecord, setNewRecord] = useState({
      type: 'expense' as 'income' | 'expense',
      amount: '',
      category: '餐饮',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
      if (user) {
        loadFinanceRecords()
      }
    }, [user])

    const loadFinanceRecords = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // 获取绑定关系
        const bindings = await getUserBindings(user.id)
        const binding = bindings.length > 0 ? bindings[0] : null
        setActiveBinding(binding)
        
        // 获取财务记录
        const financeRecords = await getFinanceRecords(user.id, binding?.id)
        setRecords(financeRecords)
      } catch (error) {
        console.error('Error loading finance records:', error)
        toast.error('加载失败', '无法加载财务记录')
      } finally {
        setLoading(false)
      }
    }

    const handleAddRecord = async () => {
      if (!user || !newRecord.amount || !newRecord.description.trim()) {
        toast.error('表单不完整', '请填写完整的金额和描述')
        return
      }

      try {
        const createdRecord = await createFinanceRecord({
          user_id: user.id,
          binding_id: activeBinding?.id,
          type: newRecord.type,
          amount: parseFloat(newRecord.amount),
          category: newRecord.category,
          description: newRecord.description.trim(),
          date: newRecord.date
        })

        setRecords(prevRecords => [createdRecord, ...prevRecords])
        setNewRecord({
          type: 'expense',
          amount: '',
          category: '餐饮',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        setIsAddingRecord(false)
        toast.success('记录创建成功', '新的财务记录已添加')
      } catch (error) {
        console.error('Error creating finance record:', error)
        toast.error('创建失败', '无法创建财务记录')
      }
    }

    const handleDeleteRecord = async (recordId: string) => {
      try {
        await deleteFinanceRecord(recordId)
        setRecords(prevRecords => prevRecords.filter(r => r.id !== recordId))
        toast.success('已删除', '财务记录已成功删除')
      } catch (error) {
        console.error('Error deleting finance record:', error)
        toast.error('删除失败', '无法删除财务记录')
      }
    }

    // 筛选记录
    const filteredRecords = useMemo(() => {
      return records.filter(record => {
        // 类型筛选
        if (filterType !== 'all' && record.type !== filterType) return false
        
        // 分类筛选
        if (filterCategory !== 'all' && record.category !== filterCategory) return false
        
        // 搜索筛选
        if (searchQuery && !record.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false
        
        return true
      })
    }, [records, filterType, filterCategory, searchQuery])

    // 计算统计数据
    const stats = useMemo(() => {
      const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
      const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
      const thisMonth = new Date().getMonth()
      const monthlyExpense = records
        .filter(r => r.type === 'expense' && new Date(r.date).getMonth() === thisMonth)
        .reduce((sum, r) => sum + r.amount, 0)
      
      return { totalIncome, totalExpense, monthlyExpense }
    }, [records])

    // 按日期分组记录
    const groupedRecords = useMemo(() => {
      const groups: { [key: string]: FinanceRecord[] } = {}
      
      filteredRecords.forEach(record => {
        const date = new Date(record.date).toLocaleDateString('zh-CN')
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(record)
      })
      
      return Object.entries(groups).sort((a, b) => 
        new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
      )
    }, [filteredRecords])

    if (loading) {
      return (
        <div className={cn('p-6 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10', className)} ref={ref}>
          <div className="text-center py-8">
            <div className="text-gray-400">加载中...</div>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10', className)} ref={ref}>
        {/* 标题栏 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">财务记录</h3>
              <p className="text-sm text-gray-400 mt-1">
                收入 ¥{stats.totalIncome.toFixed(2)} | 支出 ¥{stats.totalExpense.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setIsAddingRecord(true)}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
            >
              <Plus size={20} className="text-green-400" />
            </button>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <ArrowUpRight size={16} />
                <span className="text-xs font-medium">收入</span>
              </div>
              <p className="text-lg font-bold text-white">¥{stats.totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <ArrowDownRight size={16} />
                <span className="text-xs font-medium">支出</span>
              </div>
              <p className="text-lg font-bold text-white">¥{stats.totalExpense.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Calendar size={16} />
                <span className="text-xs font-medium">本月</span>
              </div>
              <p className="text-lg font-bold text-white">¥{stats.monthlyExpense.toFixed(2)}</p>
            </div>
          </div>

          {/* 筛选和搜索 */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索记录..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">全部类型</option>
              <option value="income">收入</option>
              <option value="expense">支出</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
            >
              <option value="all">全部分类</option>
              {Object.keys(categoryIcons).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6">
          {/* 新增记录表单 */}
          <AnimatePresence>
            {isAddingRecord && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value as 'income' | 'expense' })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      <option value="expense">支出</option>
                      <option value="income">收入</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="金额"
                      value={newRecord.amount}
                      onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                      {Object.keys(categoryIcons).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="描述"
                    value={newRecord.description}
                    onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsAddingRecord(false)}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddRecord}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition-colors"
                    >
                      添加记录
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 财务记录列表 */}
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                {records.length === 0 ? '还没有财务记录' : '没有符合条件的记录'}
              </h4>
              <p className="text-gray-400 mb-6">
                {records.length === 0 ? '开始记录你的收入和支出' : '尝试调整筛选条件'}
              </p>
              {records.length === 0 && (
                <button
                  onClick={() => setIsAddingRecord(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  创建记录
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {groupedRecords.map(([date, dayRecords]) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-400">{date}</h4>
                    <div className="text-xs text-gray-500">
                      {dayRecords.length} 条记录
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayRecords.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-lg flex items-center justify-center',
                            categoryColors[record.category || '其他']
                          )}>
                            {categoryIcons[record.category || '其他']}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">{record.description}</h4>
                              <div className={cn(
                                'text-lg font-bold',
                                record.type === 'income' ? 'text-green-400' : 'text-red-400'
                              )}>
                                {record.type === 'income' ? '+' : '-'}¥{Math.abs(record.amount).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Tag size={12} />
                                {record.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(record.date).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)

FinanceTracker.displayName = 'FinanceTracker'

export { FinanceTracker }