# 数据库设计 (DATABASE.md)

> **P-26 待办事项**: 设计和实现数据库表结构以支持品镜(Curio)应用的数据持久化。

## 核心设计原则
- **关系型数据库 (PostgreSQL)**: 利用其稳定性、可扩展性和强大的JSONB支持。
- **标准化**: 遵循第三范式 (3NF) 以减少数据冗余。
- **可扩展性**: 设计时考虑未来的功能扩展。
- **安全性**: 所有用户数据都必须得到妥善保护。

## 1. 用户 (Users)
存储用户信息，用于认证和授权。

- `id` (UUID, Primary Key): 用户唯一标识符
- `email` (VARCHAR, Unique, Not Null): 用户邮箱
- `username` (VARCHAR, Unique): 用户名
- `password_hash` (VARCHAR, Not Null): 加密后的密码
- `avatar_url` (VARCHAR): 头像链接
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 创建时间
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 更新时间

---

## 2. 心愿 (Wishes)
存储用户创建的心愿。

- `id` (UUID, Primary Key): 心愿唯一标识符
- `user_id` (UUID, Foreign Key -> users.id): 所属用户
- `title` (VARCHAR, Not Null): 心愿标题
- `description` (TEXT): 详细描述
- `image_url` (VARCHAR): 封面图片链接
- `category` (VARCHAR): 分类
- `tags` (JSONB): 标签数组
- `priority` (VARCHAR): 优先级 ('low', 'medium', 'high')
- `is_favorite` (BOOLEAN, Default: false): 是否收藏
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 创建时间
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 更新时间

---

## 3. 计划 (Plans)
存储用户创建的计划。

- `id` (UUID, Primary Key): 计划唯一标识符
- `user_id` (UUID, Foreign Key -> users.id): 创建者
- `title` (VARCHAR, Not Null): 计划标题
- `description` (TEXT): 详细描述
- `cover_image` (VARCHAR): 封面图片
- `category` (VARCHAR): 分类
- `priority` (VARCHAR): 优先级 ('low', 'medium', 'high')
- `status` (VARCHAR): 状态 ('draft', 'review', 'active', 'completed')
- `progress` (INTEGER, Default: 0): 进度百分比
- `start_date` (DATE): 开始日期
- `target_date` (DATE): 目标日期
- `created_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 创建时间
- `updated_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 更新时间

---

## 4. 计划成员 (Plan_Members)
计划与用户的多对多关系。

- `plan_id` (UUID, Foreign Key -> plans.id)
- `user_id` (UUID, Foreign Key -> users.id)
- `role` (VARCHAR): 角色 ('creator', 'collaborator', 'viewer')
- `joined_at` (TIMESTAMPTZ, Not Null, Default: NOW()): 加入时间
- **Primary Key**: (`plan_id`, `user_id`)

---

## 5. 执行路径 (Execution_Paths)
一个计划可以有多个执行路径。

- `id` (UUID, Primary Key): 路径唯一标识符
- `plan_id` (UUID, Foreign Key -> plans.id): 所属计划
- `title` (VARCHAR, Not Null): 路径标题
- `description` (TEXT): 路径描述
- `status` (VARCHAR): 状态 ('planning', 'in_progress', 'completed')
- `start_date` (DATE): 开始日期
- `end_date` (DATE): 结束日期
- `order` (INTEGER): 显示顺序

---

## 6. 里程碑 (Milestones)
一个执行路径包含多个里程碑。

- `id` (UUID, Primary Key): 里程碑唯一标识符
- `path_id` (UUID, Foreign Key -> execution_paths.id): 所属路径
- `title` (VARCHAR, Not Null): 里程碑标题
- `date` (DATE): 预计完成日期
- `completed` (BOOLEAN, Default: false): 是否完成
- `order` (INTEGER): 显示顺序 