'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { 
  getTodoItems,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  getUserBindings,
  type TodoItem
} from '@/lib/supabase/database'
import { toast } from '@/lib/stores/useToastStore'
import { CheckCircle2, Circle, Clock, AlertCircle, User, Trash2, Edit, Plus } from 'lucide-react'
import { SimpleLoader } from '@/components/ui/Skeleton'
import { motion, AnimatePresence } from 'framer-motion'

const TodoList = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className }, ref) => {
    const { user } = useAuth()
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [loading, setLoading] = useState(true)
    const [activeBinding, setActiveBinding] = useState<any>(null)
    
    // 新增待办事项状态
    const [isAddingTodo, setIsAddingTodo] = useState(false)
    const [newTodoTitle, setNewTodoTitle] = useState('')
    const [newTodoPriority, setNewTodoPriority] = useState<'low' | 'medium' | 'high'>('medium')

    useEffect(() => {
      if (user) {
        loadTodos()
      }
    }, [user])

    const loadTodos = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        
        // 获取绑定关系
        const bindings = await getUserBindings(user.id)
        const binding = bindings.length > 0 ? bindings[0] : null
        setActiveBinding(binding)
        
        // 获取待办事项
        const todoItems = await getTodoItems(user.id, binding?.id)
        setTodos(todoItems)
      } catch (error) {
        console.error('Error loading todos:', error)
        toast.error('加载失败', '无法加载待办事项')
      } finally {
        setLoading(false)
      }
    }

    const handleToggleTodo = async (todoId: string) => {
      try {
        const todo = todos.find(t => t.id === todoId)
        if (!todo) return

        const updatedTodo = await updateTodoItem(todoId, { 
          completed: !todo.completed,
          completed_at: !todo.completed ? new Date().toISOString() : null
        })

        setTodos(prevTodos => 
          prevTodos.map(t => t.id === todoId ? updatedTodo : t)
        )

        toast.success(
          updatedTodo.completed ? '任务完成！' : '任务标记为未完成',
          updatedTodo.completed ? '恭喜你完成了这个任务' : '任务已重新激活'
        )
      } catch (error) {
        console.error('Error toggling todo:', error)
        toast.error('操作失败', '无法更新任务状态')
      }
    }

    const handleDeleteTodo = async (todoId: string) => {
      try {
        await deleteTodoItem(todoId)
        setTodos(prevTodos => prevTodos.filter(t => t.id !== todoId))
        toast.success('已删除', '任务已成功删除')
      } catch (error) {
        console.error('Error deleting todo:', error)
        toast.error('删除失败', '无法删除任务')
      }
    }

    const handleAddTodo = async () => {
      if (!user || !newTodoTitle.trim()) return

      try {
        const newTodo = await createTodoItem({
          creator_id: user.id,
          binding_id: activeBinding?.id,
          title: newTodoTitle.trim(),
          priority: newTodoPriority,
          completed: false
        })

        setTodos(prevTodos => [newTodo, ...prevTodos])
        setNewTodoTitle('')
        setIsAddingTodo(false)
        toast.success('任务创建成功', '新的待办事项已添加')
      } catch (error) {
        console.error('Error creating todo:', error)
        toast.error('创建失败', '无法创建新任务')
      }
    }

    // 获取优先级图标和颜色
    const getPriorityIndicator = (priority: 'low' | 'medium' | 'high') => {
      switch (priority) {
        case 'high':
          return <AlertCircle className="w-3 h-3 text-red-400" />
        case 'medium':
          return <Clock className="w-3 h-3 text-yellow-400" />
        default:
          return <Circle className="w-3 h-3 text-gray-400" />
      }
    }

    // 获取截止日期状态
    const getDueDateStatus = (dueDate?: string) => {
      if (!dueDate) return null
      
      const now = new Date()
      const due = new Date(dueDate)
      const diffTime = due.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        return <span className="text-red-400 text-xs">已过期</span>
      }
      if (diffDays <= 1) {
        return <span className="text-orange-400 text-xs">今天到期</span>
      }
      if (diffDays <= 3) {
        return <span className="text-yellow-400 text-xs">{diffDays}天后到期</span>
      }
      return <span className="text-gray-400 text-xs">{diffDays}天后到期</span>
    }

    const completedTodos = todos.filter(todo => todo.completed)
    const pendingTodos = todos.filter(todo => !todo.completed)

    if (loading) {
      return (
        <div className={cn('p-6 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10', className)} ref={ref}>
          <div className="text-center py-8">
            <SimpleLoader />
          </div>
        </div>
      )
    }

    return (
      <div className={cn('bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10', className)} ref={ref}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-xl font-bold text-white">待办事项</h3>
            <p className="text-sm text-gray-400 mt-1">
              {pendingTodos.length} 个待完成，{completedTodos.length} 个已完成
            </p>
          </div>
          <button
            onClick={() => setIsAddingTodo(true)}
            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
          >
            <Plus size={20} className="text-purple-400" />
          </button>
        </div>

        <div className="p-6">
          {/* 新增任务表单 */}
          <AnimatePresence>
            {isAddingTodo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10"
              >
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="输入任务标题..."
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-gray-700"
                    autoFocus
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={newTodoPriority}
                      onChange={(e) => setNewTodoPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:bg-gray-700"
                    >
                      <option value="low" className="bg-gray-800 text-white">低优先级</option>
                      <option value="medium" className="bg-gray-800 text-white">中优先级</option>
                      <option value="high" className="bg-gray-800 text-white">高优先级</option>
                    </select>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => setIsAddingTodo(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleAddTodo}
                        disabled={!newTodoTitle.trim()}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        添加
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 待办事项列表 */}
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-300 mb-2">还没有待办事项</h4>
              <p className="text-gray-400 mb-6">添加第一个任务开始管理你的日程</p>
              <button
                onClick={() => setIsAddingTodo(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                创建任务
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 待完成任务 */}
              {pendingTodos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleTodo(todo.id)}
                      className="mt-0.5 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      <Circle size={20} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getPriorityIndicator(todo.priority)}
                        <h4 className="font-medium text-white line-clamp-1">{todo.title}</h4>
                      </div>
                      {todo.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-2">{todo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>创建于 {new Date(todo.created_at).toLocaleDateString('zh-CN')}</span>
                        {todo.due_date && getDueDateStatus(todo.due_date)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* 已完成任务 */}
              {completedTodos.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    已完成 ({completedTodos.length})
                  </h4>
                  <div className="space-y-2">
                    {completedTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group p-3 bg-white/3 rounded-lg border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTodo(todo.id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-400 line-through line-clamp-1">{todo.title}</h4>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span>完成于 {todo.completed_at ? new Date(todo.completed_at).toLocaleDateString('zh-CN') : ''}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

TodoList.displayName = 'TodoList'

export { TodoList }