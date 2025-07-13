-- ================================================
-- 品镜 (Curio) Supabase 数据库架构
-- 为情侣私人使用设计的数据模式
-- ================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. 用户资料表 (扩展auth.users)
-- ================================================
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS策略：用户只能查看和修改自己的资料
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看所有用户资料" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "用户只能更新自己的资料" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================
-- 2. 绑定关系表 (Together功能核心)
-- ================================================
CREATE TABLE public.bindings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  relationship_type VARCHAR(20) CHECK (relationship_type IN ('couple', 'family', 'friend')) DEFAULT 'couple',
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- 确保不能绑定自己
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- 创建唯一索引确保绑定关系的唯一性（无论谁发起）
CREATE UNIQUE INDEX unique_binding_pair ON public.bindings (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));

-- RLS策略：只能查看和管理与自己相关的绑定关系
ALTER TABLE public.bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看相关的绑定关系" ON public.bindings
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "用户可以创建绑定关系" ON public.bindings
  FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "用户可以更新相关的绑定关系" ON public.bindings
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ================================================
-- 3. 心愿表
-- ================================================
CREATE TABLE public.wishes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  category VARCHAR(50),
  tags TEXT[],
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS策略：用户只能管理自己的心愿，但可以查看绑定伙伴的心愿
ALTER TABLE public.wishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看自己和绑定伙伴的心愿" ON public.wishes
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.bindings b 
      WHERE (b.user1_id = auth.uid() OR b.user2_id = auth.uid()) 
      AND (b.user1_id = wishes.user_id OR b.user2_id = wishes.user_id)
      AND b.status = 'accepted'
    )
  );

CREATE POLICY "用户只能管理自己的心愿" ON public.wishes
  FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- 4. 计划表
-- ================================================
CREATE TABLE public.plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT,
  category VARCHAR(50),
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('draft', 'review', 'active', 'completed', 'archived')) DEFAULT 'draft',
  progress SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  target_date DATE,
  tags TEXT[],
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================
-- 5. 计划成员表
-- ================================================
CREATE TABLE public.plan_members (
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('creator', 'collaborator', 'viewer')) DEFAULT 'collaborator',
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (plan_id, user_id)
);

-- RLS策略：计划相关表的权限设计
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看参与的计划" ON public.plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      WHERE pm.plan_id = plans.id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "用户可以创建计划" ON public.plans
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "计划成员可以更新计划" ON public.plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      WHERE pm.plan_id = plans.id AND pm.user_id = auth.uid()
      AND pm.role IN ('creator', 'collaborator')
    )
  );

CREATE POLICY "用户可以查看参与的计划成员" ON public.plan_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.plan_members pm2 
      WHERE pm2.plan_id = plan_members.plan_id AND pm2.user_id = auth.uid()
    )
  );

-- ================================================
-- 6. 计划路径表
-- ================================================
CREATE TABLE public.plan_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES public.plans(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) CHECK (status IN ('planning', 'in_progress', 'completed', 'paused')) DEFAULT 'planning',
  progress SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  display_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================
-- 7. 里程碑表
-- ================================================
CREATE TABLE public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  path_id UUID REFERENCES public.plan_paths(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE,
  completed BOOLEAN DEFAULT false,
  display_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================
-- 8. 待办事项表 (Together功能)
-- ================================================
CREATE TABLE public.todo_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  binding_id UUID REFERENCES public.bindings(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS策略：待办事项可以被绑定双方查看和管理
ALTER TABLE public.todo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看相关的待办事项" ON public.todo_items
  FOR SELECT USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.bindings b 
      WHERE b.id = todo_items.binding_id 
      AND (b.user1_id = auth.uid() OR b.user2_id = auth.uid())
      AND b.status = 'accepted'
    )
  );

CREATE POLICY "用户可以管理相关的待办事项" ON public.todo_items
  FOR ALL USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.bindings b 
      WHERE b.id = todo_items.binding_id 
      AND (b.user1_id = auth.uid() OR b.user2_id = auth.uid())
      AND b.status = 'accepted'
    )
  );

-- ================================================
-- 9. 财务记录表 (Together功能)
-- ================================================
CREATE TABLE public.finance_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  binding_id UUID REFERENCES public.bindings(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('income', 'expense')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ================================================
-- 10. 报账请求表 (Together功能)
-- ================================================
CREATE TABLE public.reimbursement_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  responder_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  binding_id UUID REFERENCES public.bindings(id) ON DELETE CASCADE NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  suggested_amount DECIMAL(10,2),
  final_amount DECIMAL(10,2),
  mode VARCHAR(20) CHECK (mode IN ('full', 'range_random', 'percentage', 'custom')) DEFAULT 'full',
  mode_params JSONB, -- 存储模式参数，如随机范围等
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS策略：财务相关表的权限
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reimbursement_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "用户可以查看相关的财务记录" ON public.finance_records
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.bindings b 
      WHERE b.id = finance_records.binding_id 
      AND (b.user1_id = auth.uid() OR b.user2_id = auth.uid())
      AND b.status = 'accepted'
    )
  );

CREATE POLICY "用户可以管理自己的财务记录" ON public.finance_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户可以查看相关的报账请求" ON public.reimbursement_requests
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = responder_id
  );

CREATE POLICY "用户可以管理相关的报账请求" ON public.reimbursement_requests
  FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = responder_id
  );

-- ================================================
-- 计划相关表的RLS策略
-- ================================================
ALTER TABLE public.plan_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "计划成员可以查看路径" ON public.plan_paths
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      WHERE pm.plan_id = plan_paths.plan_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "计划成员可以查看里程碑" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.plan_members pm 
      JOIN public.plan_paths pp ON pp.plan_id = pm.plan_id
      WHERE pp.id = milestones.path_id AND pm.user_id = auth.uid()
    )
  );

-- ================================================
-- 触发器：自动更新时间戳
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有需要的表添加更新时间戳触发器
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bindings_updated_at BEFORE UPDATE ON public.bindings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishes_updated_at BEFORE UPDATE ON public.wishes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_paths_updated_at BEFORE UPDATE ON public.plan_paths 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_items_updated_at BEFORE UPDATE ON public.todo_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_records_updated_at BEFORE UPDATE ON public.finance_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 触发器：自动创建用户资料
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器：当新用户注册时自动创建资料
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 索引优化
-- ================================================
CREATE INDEX idx_wishes_user_id ON public.wishes(user_id);
CREATE INDEX idx_wishes_category ON public.wishes(category);
CREATE INDEX idx_wishes_is_favorite ON public.wishes(is_favorite);

CREATE INDEX idx_plans_creator_id ON public.plans(creator_id);
CREATE INDEX idx_plans_status ON public.plans(status);

CREATE INDEX idx_plan_members_user_id ON public.plan_members(user_id);
CREATE INDEX idx_plan_members_plan_id ON public.plan_members(plan_id);

CREATE INDEX idx_bindings_user1_id ON public.bindings(user1_id);
CREATE INDEX idx_bindings_user2_id ON public.bindings(user2_id);
CREATE INDEX idx_bindings_status ON public.bindings(status);

CREATE INDEX idx_todo_items_creator_id ON public.todo_items(creator_id);
CREATE INDEX idx_todo_items_binding_id ON public.todo_items(binding_id);
CREATE INDEX idx_todo_items_completed ON public.todo_items(completed);

CREATE INDEX idx_finance_records_user_id ON public.finance_records(user_id);
CREATE INDEX idx_finance_records_binding_id ON public.finance_records(binding_id);
CREATE INDEX idx_finance_records_date ON public.finance_records(date);
CREATE INDEX idx_finance_records_type ON public.finance_records(type);

-- ================================================
-- 预设数据：为情侣创建默认账户
-- ================================================
-- 注意：实际的用户注册需要通过Supabase Auth API完成
-- 这里只是预留数据结构，实际部署时需要手动注册两个账户

-- ================================================
-- 实时订阅设置
-- ================================================
-- 启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE public.todo_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reimbursement_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bindings;

-- ================================================
-- 结束
-- ================================================
-- 数据库架构创建完成！
-- 下一步：在Supabase项目中执行此SQL脚本