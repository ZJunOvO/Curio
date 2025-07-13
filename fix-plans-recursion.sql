-- 紧急修复plans表的无限递归问题

-- 删除所有可能导致递归的plans表策略
DROP POLICY IF EXISTS "用户可以查看自己创建的计划" ON public.plans;
DROP POLICY IF EXISTS "计划成员可以查看计划" ON public.plans;
DROP POLICY IF EXISTS "用户可以查看自己的计划和参与的计划" ON public.plans;
DROP POLICY IF EXISTS "用户可以查看参与的计划" ON public.plans;

-- 创建最简单的plans表策略，只允许用户查看自己创建的计划
CREATE POLICY "简单的计划查看策略" ON public.plans
  FOR SELECT USING (auth.uid() = creator_id);

-- 删除所有可能导致递归的plan_members表策略
DROP POLICY IF EXISTS "用户可以查看相关的计划成员" ON public.plan_members;
DROP POLICY IF EXISTS "计划创建者可以管理成员" ON public.plan_members;
DROP POLICY IF EXISTS "用户可以查看参与的计划成员" ON public.plan_members;

-- 创建最简单的plan_members表策略
CREATE POLICY "简单的成员查看策略" ON public.plan_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "简单的成员管理策略" ON public.plan_members
  FOR ALL USING (user_id = auth.uid());

-- 确保其他策略保持简单
-- 创建计划策略保持不变
-- 更新计划策略也要简化
DROP POLICY IF EXISTS "计划创建者和成员可以更新计划" ON public.plans;
DROP POLICY IF EXISTS "计划成员可以更新计划" ON public.plans;

CREATE POLICY "简单的计划更新策略" ON public.plans
  FOR UPDATE USING (auth.uid() = creator_id);