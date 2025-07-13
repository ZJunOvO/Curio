import { supabase } from './client'

// ================================================
// 用户资料相关操作
// ================================================

export interface UserProfile {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// 获取用户资料
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

// 更新用户资料
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

// ================================================
// 绑定关系相关操作
// ================================================

export interface Binding {
  id: string
  user1_id: string
  user2_id: string
  relationship_type: 'couple' | 'family' | 'friend'
  status: 'pending' | 'accepted' | 'rejected' | 'blocked'
  created_at: string
  updated_at: string
  user1?: UserProfile
  user2?: UserProfile
}

// 创建绑定关系
export async function createBinding(
  user1Id: string, 
  user2Email: string, 
  relationshipType: 'couple' | 'family' | 'friend' = 'couple'
) {
  // 首先根据邮箱查找用户
  const { data: user2Profile, error: userError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', user2Email)
    .single()

  if (userError || !user2Profile) {
    throw new Error('找不到该邮箱对应的用户')
  }

  const { data, error } = await supabase
    .from('bindings')
    .insert({
      user1_id: user1Id,
      user2_id: user2Profile.id,
      relationship_type: relationshipType,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating binding:', error)
    throw error
  }

  return data
}

// 获取用户的绑定关系
export async function getUserBindings(userId: string) {
  const { data, error } = await supabase
    .from('bindings')
    .select(`
      *,
      user1:user_profiles!bindings_user1_id_fkey(id, email, username, avatar_url),
      user2:user_profiles!bindings_user2_id_fkey(id, email, username, avatar_url)
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'accepted')

  if (error) {
    console.error('Error fetching user bindings:', error)
    throw error
  }

  return data || []
}

// 获取待处理的绑定邀请
export async function getPendingBindings(userId: string) {
  const { data, error } = await supabase
    .from('bindings')
    .select(`
      *,
      user1:user_profiles!bindings_user1_id_fkey(id, email, username, avatar_url),
      user2:user_profiles!bindings_user2_id_fkey(id, email, username, avatar_url)
    `)
    .eq('user2_id', userId)  // 只获取发送给当前用户的邀请
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching pending bindings:', error)
    throw error
  }

  return data || []
}

// 响应绑定请求
export async function respondToBinding(bindingId: string, status: 'accepted' | 'rejected') {
  const { data, error } = await supabase
    .from('bindings')
    .update({ status })
    .eq('id', bindingId)
    .select()
    .single()

  if (error) {
    console.error('Error responding to binding:', error)
    throw error
  }

  return data
}

// ================================================
// 心愿相关操作
// ================================================

export interface Wish {
  id: string
  user_id: string
  title: string
  description?: string
  image_url?: string
  source_url?: string
  category?: string
  tags?: string[]
  priority: 'low' | 'medium' | 'high'
  is_favorite: boolean
  created_at: string
  updated_at: string
}

// 获取用户的心愿（包括绑定伙伴的心愿）
export async function getUserWishes(userId: string) {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching wishes:', error)
    throw error
  }

  return data || []
}

// 创建心愿
export async function createWish(wish: Omit<Wish, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('wishes')
    .insert(wish)
    .select()
    .single()

  if (error) {
    console.error('Error creating wish:', error)
    throw error
  }

  return data
}

// 更新心愿
export async function updateWish(wishId: string, updates: Partial<Wish>) {
  const { data, error } = await supabase
    .from('wishes')
    .update(updates)
    .eq('id', wishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating wish:', error)
    throw error
  }

  return data
}

// 删除心愿
export async function deleteWish(wishId: string) {
  const { error } = await supabase
    .from('wishes')
    .delete()
    .eq('id', wishId)

  if (error) {
    console.error('Error deleting wish:', error)
    throw error
  }
}

// ================================================
// 待办事项相关操作
// ================================================

export interface TodoItem {
  id: string
  creator_id: string
  binding_id?: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// 获取待办事项
export async function getTodoItems(userId: string, bindingId?: string) {
  let query = supabase
    .from('todo_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (bindingId) {
    query = query.eq('binding_id', bindingId)
  } else {
    query = query.eq('creator_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching todo items:', error)
    throw error
  }

  return data
}

// 创建待办事项
export async function createTodoItem(todo: Omit<TodoItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('todo_items')
    .insert(todo)
    .select()
    .single()

  if (error) {
    console.error('Error creating todo item:', error)
    throw error
  }

  return data
}

// 更新待办事项
export async function updateTodoItem(todoId: string, updates: Partial<TodoItem>) {
  // 如果是标记为完成，设置完成时间
  if (updates.completed && !updates.completed_at) {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('todo_items')
    .update(updates)
    .eq('id', todoId)
    .select()
    .single()

  if (error) {
    console.error('Error updating todo item:', error)
    throw error
  }

  return data
}

// 删除待办事项
export async function deleteTodoItem(todoId: string) {
  const { error } = await supabase
    .from('todo_items')
    .delete()
    .eq('id', todoId)

  if (error) {
    console.error('Error deleting todo item:', error)
    throw error
  }
}

// ================================================
// 财务记录相关操作
// ================================================

export interface FinanceRecord {
  id: string
  user_id: string
  binding_id?: string
  type: 'income' | 'expense'
  amount: number
  category?: string
  description?: string
  date: string
  created_at: string
  updated_at: string
}

// 获取财务记录
export async function getFinanceRecords(userId: string, bindingId?: string) {
  let query = supabase
    .from('finance_records')
    .select('*')
    .order('date', { ascending: false })

  if (bindingId) {
    query = query.eq('binding_id', bindingId)
  } else {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching finance records:', error)
    throw error
  }

  return data
}

// 创建财务记录
export async function createFinanceRecord(record: Omit<FinanceRecord, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('finance_records')
    .insert(record)
    .select()
    .single()

  if (error) {
    console.error('Error creating finance record:', error)
    throw error
  }

  return data
}

// 更新财务记录
export async function updateFinanceRecord(recordId: string, updates: Partial<FinanceRecord>) {
  const { data, error } = await supabase
    .from('finance_records')
    .update(updates)
    .eq('id', recordId)
    .select()
    .single()

  if (error) {
    console.error('Error updating finance record:', error)
    throw error
  }

  return data
}

// 删除财务记录
export async function deleteFinanceRecord(recordId: string) {
  const { error } = await supabase
    .from('finance_records')
    .delete()
    .eq('id', recordId)

  if (error) {
    console.error('Error deleting finance record:', error)
    throw error
  }
}

// ================================================
// 计划相关操作
// ================================================

export interface Plan {
  id: string
  creator_id: string
  title: string
  description?: string
  cover_image?: string
  category?: string
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'review' | 'active' | 'completed' | 'archived'
  progress: number
  start_date?: string
  target_date?: string
  tags?: string[]
  metrics?: any
  created_at: string
  updated_at: string
}

export interface PlanMember {
  plan_id: string
  user_id: string
  role: 'creator' | 'collaborator' | 'viewer'
  joined_at: string
}

export interface PlanPath {
  id: string
  plan_id: string
  title: string
  description?: string
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  progress: number
  start_date?: string
  end_date?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  path_id: string
  title: string
  description?: string
  date?: string
  completed: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// 获取用户参与的所有计划
export async function getUserPlans(userId: string) {
  const { data, error } = await supabase
    .from('plans')
    .select(`
      *,
      plan_members!inner(user_id, role),
      creator:user_profiles!plans_creator_id_fkey(id, username, avatar_url)
    `)
    .eq('plan_members.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user plans:', error)
    throw error
  }

  return data
}

// 创建新计划
export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>) {
  const { data: newPlan, error: planError } = await supabase
    .from('plans')
    .insert(plan)
    .select()
    .single()

  if (planError) {
    console.error('Error creating plan:', planError)
    throw planError
  }

  // 自动添加创建者为计划成员
  const { error: memberError } = await supabase
    .from('plan_members')
    .insert({
      plan_id: newPlan.id,
      user_id: plan.creator_id,
      role: 'creator'
    })

  if (memberError) {
    console.error('Error adding plan creator as member:', memberError)
    throw memberError
  }

  return newPlan
}

// 更新计划
export async function updatePlan(planId: string, updates: Partial<Plan>) {
  const { data, error } = await supabase
    .from('plans')
    .update(updates)
    .eq('id', planId)
    .select()
    .single()

  if (error) {
    console.error('Error updating plan:', error)
    throw error
  }

  return data
}

// 删除计划
export async function deletePlan(planId: string) {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId)

  if (error) {
    console.error('Error deleting plan:', error)
    throw error
  }
}

// 获取计划详情（包含所有相关数据）
export async function getPlanDetails(planId: string) {
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select(`
      *,
      creator:user_profiles!plans_creator_id_fkey(id, username, avatar_url),
      plan_members(
        user_id,
        role,
        joined_at,
        user:user_profiles!plan_members_user_id_fkey(id, username, avatar_url)
      ),
      plan_paths(
        *,
        milestones(*)
      )
    `)
    .eq('id', planId)
    .single()

  if (planError) {
    console.error('Error fetching plan details:', planError)
    throw planError
  }

  return plan
}

// 添加计划成员
export async function addPlanMember(planId: string, userId: string, role: 'collaborator' | 'viewer' = 'collaborator') {
  const { data, error } = await supabase
    .from('plan_members')
    .insert({
      plan_id: planId,
      user_id: userId,
      role
    })
    .select()
    .single()

  if (error) {
    console.error('Error adding plan member:', error)
    throw error
  }

  return data
}

// 移除计划成员
export async function removePlanMember(planId: string, userId: string) {
  const { error } = await supabase
    .from('plan_members')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing plan member:', error)
    throw error
  }
}

// 创建计划路径
export async function createPlanPath(path: Omit<PlanPath, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('plan_paths')
    .insert(path)
    .select()
    .single()

  if (error) {
    console.error('Error creating plan path:', error)
    throw error
  }

  return data
}

// 更新计划路径
export async function updatePlanPath(pathId: string, updates: Partial<PlanPath>) {
  const { data, error } = await supabase
    .from('plan_paths')
    .update(updates)
    .eq('id', pathId)
    .select()
    .single()

  if (error) {
    console.error('Error updating plan path:', error)
    throw error
  }

  return data
}

// 删除计划路径
export async function deletePlanPath(pathId: string) {
  const { error } = await supabase
    .from('plan_paths')
    .delete()
    .eq('id', pathId)

  if (error) {
    console.error('Error deleting plan path:', error)
    throw error
  }
}

// 创建里程碑
export async function createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('milestones')
    .insert(milestone)
    .select()
    .single()

  if (error) {
    console.error('Error creating milestone:', error)
    throw error
  }

  return data
}

// 更新里程碑
export async function updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
  const { data, error } = await supabase
    .from('milestones')
    .update(updates)
    .eq('id', milestoneId)
    .select()
    .single()

  if (error) {
    console.error('Error updating milestone:', error)
    throw error
  }

  return data
}

// 删除里程碑
export async function deleteMilestone(milestoneId: string) {
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', milestoneId)

  if (error) {
    console.error('Error deleting milestone:', error)
    throw error
  }
}