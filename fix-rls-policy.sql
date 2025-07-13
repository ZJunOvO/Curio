-- 修复plans表的RLS策略
-- 删除旧的策略
DROP POLICY IF EXISTS "用户可以查看参与的计划" ON public.plans;

-- 创建新的策略，允许用户查看自己创建的计划或参与的计划
CREATE POLICY "用户可以查看自己的计划和参与的计划" ON public.plans
  FOR SELECT USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      WHERE pm.plan_id = plans.id AND pm.user_id = auth.uid()
    )
  );

-- 同样修复更新策略，确保创建者可以更新自己的计划
DROP POLICY IF EXISTS "计划成员可以更新计划" ON public.plans;

CREATE POLICY "计划创建者和成员可以更新计划" ON public.plans
  FOR UPDATE USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      WHERE pm.plan_id = plans.id AND pm.user_id = auth.uid()
      AND pm.role IN ('creator', 'collaborator')
    )
  );