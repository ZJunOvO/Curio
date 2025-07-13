# 数据库设计 (DATABASE.md)

本文件定义了品镜 (Curio) 应用所需的所有数据库表结构，基于 PostgreSQL 设计。

## 核心设计原则
- **关系型数据库 (PostgreSQL)**: 利用其稳定性、可扩展性和强大的 `JSONB`、`TEXT[]` 支持。
- **标准化与非标准化结合**: 核心关系遵循第三范式 (3NF) 以减少数据冗余，同时利用 `JSONB` 存储半结构化数据以提高灵活性。
- **UUIDs**: 所有主键使用 `UUID`，便于分布式系统扩展。
- **时间戳**: 统一使用 `TIMESTAMPTZ` 以处理时区。
- **命名规范**: 表名使用复数形式（如 `users`, `plans`），字段名使用蛇形命名法（`snake_case`）。

---

## 目录
1. [用户 (`users`)](#1-用户-users)
2. [心愿 (`wishes`)](#2-心愿-wishes)
3. [计划 (`plans`)](#3-计划-plans)
4. [计划成员 (`plan_members`)](#4-计划成员-plan_members)
5. [计划审批 (`plan_approvals`)](#5-计划审批-plan_approvals)
6. [计划版本 (`plan_versions`)](#6-计划版本-plan_versions)
7. [计划路径 (`plan_paths`)](#7-计划路径-plan_paths)
8. [里程碑 (`milestones`)](#8-里程碑-milestones)
9. [计划动态 (`plan_activities`)](#9-计划动态-plan_activities)

---

## 1. 用户 (`users`)
存储用户信息，用于认证和授权。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 用户唯一标识符 |
| `email` | `VARCHAR(255)` | **Unique**, **Not Null** | 用户邮箱 |
| `username` | `VARCHAR(50)` | **Unique** | 用户名 |
| `password_hash` | `VARCHAR(255)` | **Not Null** | 加密后的密码 |
| `avatar_url` | `TEXT` | | 头像链接 |
| `created_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 创建时间 |
| `updated_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 更新时间 |

---

## 2. 心愿 (`wishes`)
存储用户创建的心愿。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 心愿唯一标识符 |
| `user_id` | `UUID` | **Foreign Key** -> `users.id` | 所属用户 |
| `title` | `VARCHAR(255)` | **Not Null** | 心愿标题 |
| `description` | `TEXT` | | 详细描述 |
| `image_url` | `TEXT` | | 封面图片链接 |
| `source_url` | `TEXT` | | 来源链接 (例如商品、文章) |
| `category` | `VARCHAR(50)` | | 分类 |
| `tags` | `TEXT[]` | | 标签数组 |
| `priority` | `VARCHAR(20)` | `CHECK (priority IN ('low', 'medium', 'high'))` | 优先级 |
| `is_favorite` | `BOOLEAN` | `Default: false` | 是否收藏 |
| `created_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 创建时间 |
| `updated_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 更新时间 |

---

## 3. 计划 (`plans`)
存储用户创建的计划核心信息。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 计划唯一标识符 |
| `creator_id` | `UUID` | **Foreign Key** -> `users.id` | 创建者用户ID |
| `title` | `VARCHAR(255)` | **Not Null** | 计划标题 |
| `description` | `TEXT` | | 详细描述 |
| `cover_image` | `TEXT` | | 封面图片 |
| `category` | `VARCHAR(50)` | | 分类 |
| `priority` | `VARCHAR(20)` | `CHECK (priority IN ('low', 'medium', 'high'))` | 优先级 |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('draft', 'review', 'active', 'completed', 'archived'))` | 状态 |
| `progress` | `SMALLINT` | `Default: 0`, `CHECK (progress >= 0 AND progress <= 100)` | 进度百分比 |
| `start_date` | `DATE` | | 开始日期 |
| `target_date` | `DATE` | | 目标日期 |
| `tags` | `TEXT[]` | | 标签数组 |
| `metrics` | `JSONB` | | 其他指标 (例如预算) |
| `current_version_id` | `UUID` | **Foreign Key** -> `plan_versions.id` | 当前活动版本ID |
| `created_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 创建时间 |
| `updated_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 更新时间 |

---

## 4. 计划成员 (`plan_members`)
定义计划与用户的多对多关系。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `plan_id` | `UUID` | **Foreign Key** -> `plans.id`, **Primary Key** | 所属计划ID |
| `user_id` | `UUID` | **Foreign Key** -> `users.id`, **Primary Key** | 参与用户ID |
| `role` | `VARCHAR(20)` | `CHECK (role IN ('creator', 'collaborator', 'viewer'))` | 角色 |
| `joined_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 加入时间 |

---

## 5. 计划审批 (`plan_approvals`)
记录计划成员的审批状态。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 审批记录唯一ID |
| `plan_id` | `UUID` | **Foreign Key** -> `plans.id` | 所属计划ID |
| `member_id` | `UUID` | **Foreign Key** -> `users.id` | 审批成员ID |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('approved', 'rejected', 'pending', 'discussion'))` | 审批状态 |
| `comment` | `TEXT` | | 审批意见 |
| `created_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 创建时间 |

---

## 6. 计划版本 (`plan_versions`)
记录计划的重大版本变更历史。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 版本唯一ID |
| `plan_id` | `UUID` | **Foreign Key** -> `plans.id` | 所属计划ID |
| `creator_id` | `UUID` | **Foreign Key** -> `users.id` | 版本创建者ID |
| `version_string`| `VARCHAR(50)` | | 版本号 (e.g., "v1.0", "v2.1-beta") |
| `title` | `VARCHAR(255)` | | 版本标题 |
| `description` | `TEXT` | | 版本描述 |
| `changes` | `TEXT[]` | | 变更内容列表 |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('active', 'archived', 'draft'))` | 版本状态 |
| `created_at` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 创建时间 |

---

## 7. 计划路径 (`plan_paths`)
一个计划可以有多个执行阶段或路径。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 路径唯一标识符 |
| `plan_id` | `UUID` | **Foreign Key** -> `plans.id` | 所属计划 |
| `title` | `VARCHAR(255)` | **Not Null** | 路径标题 |
| `description` | `TEXT` | | 路径描述 |
| `status` | `VARCHAR(20)` | `CHECK (status IN ('planning', 'in_progress', 'completed', 'paused'))` | 状态 |
| `progress` | `SMALLINT` | `Default: 0`, `CHECK (progress >= 0 AND progress <= 100)` | 进度百分比 |
| `start_date` | `DATE` | | 开始日期 |
| `end_date` | `DATE` | | 结束日期 |
| `display_order` | `SMALLINT` | `Default: 0` | 显示顺序 |

---

## 8. 里程碑 (`milestones`)
一个执行路径包含多个里程碑。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `UUID` | **Primary Key**, `gen_random_uuid()` | 里程碑唯一标识符 |
| `path_id` | `UUID` | **Foreign Key** -> `plan_paths.id` | 所属路径 |
| `title` | `VARCHAR(255)` | **Not Null** | 里程碑标题 |
| `date` | `DATE` | | 预计完成日期 |
| `completed` | `BOOLEAN` | `Default: false` | 是否完成 |
| `display_order` | `SMALLINT` | `Default: 0` | 显示顺序 |

---

## 9. 计划动态 (`plan_activities`)
记录与计划相关的重要活动日志。

| 字段名 | 类型 | 约束 | 描述 |
| --- | --- | --- | --- |
| `id` | `BIGSERIAL` | **Primary Key** | 动态唯一ID (使用自增整数) |
| `plan_id` | `UUID` | **Foreign Key** -> `plans.id` | 所属计划ID |
| `actor_id` | `UUID` | **Foreign Key** -> `users.id` | 操作者ID |
| `type` | `VARCHAR(50)` | | 活动类型 (e.g., 'creation', 'comment') |
| `description` | `TEXT` | | 动态描述 |
| `details` | `JSONB` | | 额外细节 |
| `timestamp` | `TIMESTAMPTZ` | **Not Null**, `Default: NOW()` | 活动发生时间 | 