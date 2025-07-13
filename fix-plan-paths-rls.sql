-- 修复plan_paths表的RLS策略问题

-- 检查并创建plan_paths表的RLS策略
DROP POLICY IF EXISTS "计划成员可以查看路径" ON public.plan_paths;
DROP POLICY IF EXISTS "用户可以管理计划路径" ON public.plan_paths;

-- 创建简单的plan_paths策略
CREATE POLICY "用户可以查看自己计划的路径" ON public.plan_paths
  FOR SELECT USING (
    plan_id IN (
      SELECT id FROM public.plans WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "用户可以管理自己计划的路径" ON public.plan_paths
  FOR ALL USING (
    plan_id IN (
      SELECT id FROM public.plans WHERE creator_id = auth.uid()
    )
  );

-- 修复milestones表的RLS策略
DROP POLICY IF EXISTS "计划成员可以查看里程碑" ON public.milestones;
DROP POLICY IF EXISTS "用户可以管理里程碑" ON public.milestones;

CREATE POLICY "用户可以查看自己计划的里程碑" ON public.milestones
  FOR SELECT USING (
    path_id IN (
      SELECT pp.id FROM public.plan_paths pp
      JOIN public.plans p ON pp.plan_id = p.id
      WHERE p.creator_id = auth.uid()
    )
  );

CREATE POLICY "用户可以管理自己计划的里程碑" ON public.milestones
  FOR ALL USING (
    path_id IN (
      SELECT pp.id FROM public.plan_paths pp
      JOIN public.plans p ON pp.plan_id = p.id
      WHERE p.creator_id = auth.uid()
    )
  );