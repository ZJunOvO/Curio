-- 修复plan_members表的无限递归RLS策略问题

-- 删除有问题的plan_members策略
DROP POLICY IF EXISTS "用户可以查看参与的计划成员" ON public.plan_members;

-- 创建简单的plan_members策略，避免自引用
CREATE POLICY "用户可以查看相关的计划成员" ON public.plan_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    plan_id IN (
      SELECT id FROM public.plans 
      WHERE creator_id = auth.uid()
    )
  );

-- 确保plan_members表的其他策略也没有递归问题
DROP POLICY IF EXISTS "用户可以管理计划成员" ON public.plan_members;

CREATE POLICY "计划创建者可以管理成员" ON public.plan_members
  FOR ALL USING (
    plan_id IN (
      SELECT id FROM public.plans 
      WHERE creator_id = auth.uid()
    )
  );

-- 为了安全起见，也简化plans表的策略，避免复杂的EXISTS查询
DROP POLICY IF EXISTS "用户可以查看自己的计划和参与的计划" ON public.plans;

-- 创建更简单的plans表策略
CREATE POLICY "用户可以查看自己创建的计划" ON public.plans
  FOR SELECT USING (auth.uid() = creator_id);

-- 如果需要成员访问，可以单独添加
CREATE POLICY "计划成员可以查看计划" ON public.plans
  FOR SELECT USING (
    id IN (
      SELECT plan_id FROM public.plan_members 
      WHERE user_id = auth.uid()
    )
  );