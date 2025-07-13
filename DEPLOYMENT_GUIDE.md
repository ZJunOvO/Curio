# 🚀 品镜 (Curio) 部署指南

为情侣专用生活管理应用的完整部署流程

## 📋 部署前准备

### 1. Supabase 项目设置

#### 创建 Supabase 项目
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织，输入项目名称：`curio-couple-app`
4. 设置数据库密码（记住这个密码）
5. 选择区域（推荐：东京或新加坡）
6. 点击 "Create new project"

#### 执行数据库架构
1. 在 Supabase Dashboard 中，进入 "SQL Editor"
2. 创建新查询，复制 `supabase-schema.sql` 的全部内容
3. 点击 "Run" 执行 SQL 脚本
4. 确认所有表创建成功

#### 获取项目配置
1. 进入 "Settings" > "API"
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role key（可选，谨慎保管）

### 2. Vercel 项目设置

#### 连接 GitHub
1. 将代码推送到 GitHub 仓库
2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 导入项目

#### 环境变量配置
在 Vercel 项目设置中添加以下环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xjbzyrrjprqxvrgxfryd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnp5cnJqcHJxeHZyZ3hmcnlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDc5MjgsImV4cCI6MjA2Nzk4MzkyOH0.aK3EIcsV80-gTXoNCnvX8JQRiJxel911dhs8qO3X20Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnp5cnJqcHJxeHZyZ3hmcnlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQwNzkyOCwiZXhwIjoyMDY3OTgzOTI4fQ.__702C3NWRg_9bXwvLYw6L76Gs41m-_hdj6uI3nbac8
```

#### Vercel 部署详细步骤
1. **项目导入**:
   - 登录 [Vercel Dashboard](https://vercel.com/dashboard)
   - 点击 "Add New..." → "Project" 
   - 连接 GitHub 并选择 "Curio" 仓库
   - 确认根目录结构正确（项目文件直接在根目录）

2. **部署配置**:
   - Framework: Next.js (自动检测)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`
   - Node.js Version: 18.x

3. **环境变量设置**:
   - 在项目设置中进入 "Environment Variables"
   - 逐个添加上述三个环境变量
   - 点击 "Redeploy" 重新部署

4. **验证部署**:
   - 访问 Vercel 提供的部署 URL
   - 测试用户注册/登录功能
   - 验证数据库连接和功能正常

## 🔧 本地开发设置

### 1. 环境变量
复制 `.env.example` 为 `.env.local`：
```bash
cp .env.example .env.local
```

填入真实的 Supabase 配置：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2. 安装依赖并启动
```bash
npm install
npm run dev
```

应用将在 `http://localhost:3000` 启动

## 👥 创建你们的账户

### 方法一：通过注册页面
1. 访问 `/auth/register`
2. 分别注册两个账户：
   - `1282477078@qq.com`
   - `3158079858@qq.com`
3. 检查邮箱确认链接（如果需要）

### 方法二：通过 Supabase Dashboard
1. 进入 "Authentication" > "Users"
2. 点击 "Add user"
3. 手动创建两个用户账户
4. 设置邮箱确认状态为已确认

### 方法三：禁用邮箱确认（推荐用于私人项目）
1. 进入 "Authentication" > "Settings"
2. 关闭 "Enable email confirmations"
3. 这样注册后就能立即使用

## 🔗 建立绑定关系

### 自动绑定设置
可以通过数据库直接创建绑定关系：

```sql
-- 在 Supabase SQL Editor 中执行
INSERT INTO public.bindings (user1_id, user2_id, relationship_type, status)
SELECT 
  u1.id,
  u2.id,
  'couple',
  'accepted'
FROM public.user_profiles u1, public.user_profiles u2
WHERE u1.email = '1282477078@qq.com' 
  AND u2.email = '3158079858@qq.com';
```

### 手动绑定（应用内）
1. 登录任一账户
2. 访问 Together 页面
3. 使用"绑定伙伴"功能
4. 输入对方邮箱发起绑定
5. 对方登录后确认绑定

## 🌐 域名配置（可选）

### 自定义域名
1. 在 Vercel 项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

### 建议域名
- `curio.love`
- `our-curio.com`
- `couple.curio.app`

## 🔒 安全建议

### 数据库安全
- ✅ RLS（行级安全）已启用
- ✅ 用户只能访问自己和绑定伙伴的数据
- ✅ 所有敏感操作都有权限检查

### 认证安全
- 建议启用两步验证
- 定期更换密码
- 使用强密码

### 环境变量安全
- 永远不要将 `.env.local` 提交到代码仓库
- Service Role Key 只在服务端使用
- 定期轮换 API 密钥

## 📊 监控和分析

### Supabase 监控
1. 进入 "Settings" > "Usage"
2. 监控数据库使用量
3. 设置使用量警报

### Vercel 分析
1. 在 Vercel 项目中启用 Analytics
2. 监控页面性能和访问量

## 🚨 故障排除

### 常见问题

#### 1. 认证问题
```bash
# 检查环境变量是否正确
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### 2. 数据库连接问题
- 确认 SQL 脚本已正确执行
- 检查 RLS 策略是否正确配置
- 验证用户权限设置

#### 3. 部署问题
- 检查 Vercel 环境变量配置
- 查看 Vercel 部署日志
- 确认构建过程无错误

### 调试模式
在 `.env.local` 中添加：
```bash
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 📱 移动端访问

### PWA 配置
应用已配置为 PWA，支持：
- 添加到主屏幕
- 离线访问基本功能
- 推送通知（未来功能）

### 移动端优化
- 响应式设计适配所有设备
- 触摸友好的交互
- 优化的加载性能

## 🔮 后续扩展

### 功能扩展
- [ ] 推送通知
- [ ] 文件上传和存储
- [ ] 实时协作编辑
- [ ] 数据导出和备份

### 性能优化
- [ ] 图片压缩和 CDN
- [ ] 数据库查询优化
- [ ] 缓存策略优化

---

## 🎉 部署完成检查清单

- [ ] Supabase 项目创建并配置
- [ ] 数据库架构执行成功
- [ ] Vercel 项目部署成功
- [ ] 环境变量配置正确
- [ ] 两个用户账户创建成功
- [ ] 绑定关系建立成功
- [ ] 所有功能测试通过
- [ ] 域名配置（如果需要）

完成这些步骤后，你们的专属品镜应用就正式上线了！ 🎊

---

**技术支持**: 如遇到问题，可以查看：
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [Next.js 文档](https://nextjs.org/docs)