# API 文档 (API.md)

本文件定义了品镜 (Curio) 应用的 RESTful API 接口，用于前后端数据交互。

## API 设计原则
- **RESTful**: 遵循 RESTful 架构风格，使用标准的 HTTP 方法。
- **JSON**: 所有数据交换使用 JSON 格式。
- **认证**: 使用 JWT (JSON Web Tokens) 进行无状态认证，通过 `Authorization: Bearer <token>` 头传递。
- **错误处理**: 标准化的错误响应格式 (e.g., `{ "error": "...", "message": "..." }`)。
- **版本控制**: API 通过 URL 进行版本控制 (e.g., `/api/v1/...`)。
- **命名规范**: API 路由使用复数、小写、短横线分隔（`kebab-case`）。

---

## 目录
1. [认证 API (`/auth`)](#1-认证-api-auth)
2. [心愿 API (`/wishes`)](#2-心愿-api-wishes)
3. [计划 API (`/plans`)](#3-计划-api-plans)
    - [计划成员 (`/plans/:planId/members`)](#计划成员-api)
    - [计划审批 (`/plans/:planId/approvals`)](#计划审批-api)
    - [计划版本 (`/plans/:planId/versions`)](#计划版本-api)
    - [计划动态 (`/plans/:planId/activities`)](#计划动态-api)
4. [路径与里程碑 API](#4-路径与里程碑-api)

---

## 1. 认证 API (`/auth`)

### `POST /api/v1/auth/register`
- **描述**: 注册新用户。
- **请求体**: `{ "email": "...", "password": "...", "username": "..." }`
- **响应**: `201 Created` - `{ "token": "...", "user": { ... } }`

### `POST /api/v1/auth/login`
- **描述**: 用户登录。
- **请求体**: `{ "email": "...", "password": "..." }`
- **响应**: `200 OK` - `{ "token": "...", "user": { ... } }`

---

## 2. 心愿 API (`/wishes`)

### `GET /api/v1/wishes`
- **描述**: 获取当前用户的所有心愿。
- **认证**: 需要。
- **查询参数**: `priority`, `category`, `is_favorite`, `search`。
- **响应**: `200 OK` - `[{ wish_object }, ...]`

### `POST /api/v1/wishes`
- **描述**: 创建一个新心愿。
- **认证**: 需要。
- **请求体**: `{ title, description?, imageUrl?, sourceUrl?, ... }`
- **响应**: `201 Created` - `{ new_wish_object }`

### `GET /api/v1/wishes/:id`
- **描述**: 获取指定ID的心愿详情。
- **认证**: 需要。
- **响应**: `200 OK` - `{ wish_object }`

### `PUT /api/v1/wishes/:id`
- **描述**: 更新指定ID的心愿。
- **认证**: 需要。
- **请求体**: `{ updated_wish_data }`
- **响应**: `200 OK` - `{ updated_wish_object }`

### `DELETE /api/v1/wishes/:id`
- **描述**: 删除指定ID的心愿。
- **认证**: 需要。
- **响应**: `204 No Content`

---

## 3. 计划 API (`/plans`)

### `GET /api/v1/plans`
- **描述**: 获取与用户相关的所有计划（自己创建的或作为成员参与的）。
- **认证**: 需要。
- **查询参数**: `status`, `priority`, `category`, `search`。
- **响应**: `200 OK` - `[{ plan_object }, ...]`

### `POST /api/v1/plans`
- **描述**: 创建一个新计划。
- **认证**: 需要。
- **请求体**: `{ title, description?, category, ... }`
- **响应**: `201 Created` - `{ new_plan_object }`

### `GET /api/v1/plans/:id`
- **描述**: 获取指定ID的计划详情，包含成员、路径、里程碑等完整信息。
- **认证**: 需要。
- **响应**: `200 OK` - `{ plan_object_with_details }`

### `PUT /api/v1/plans/:id`
- **描述**: 更新指定ID的计划核心信息。
- **认证**: 需要。
- **请求体**: `{ updated_plan_data }`
- **响应**: `200 OK` - `{ updated_plan_object }`

### `DELETE /api/v1/plans/:id`
- **描述**: 删除指定ID的计划。
- **认证**: 需要，仅限创建者。
- **响应**: `204 No Content`

### 计划成员 API
#### `GET /api/v1/plans/:planId/members`
- **描述**: 获取计划的所有成员。
- **响应**: `200 OK` - `[{ member_object }, ...]`

#### `POST /api/v1/plans/:planId/members`
- **描述**: 邀请新成员加入计划。
- **请求体**: `{ "userId": "...", "role": "collaborator" }`
- **响应**: `201 Created` - `{ new_member_object }`

#### `DELETE /api/v1/plans/:planId/members/:userId`
- **描述**: 从计划中移除成员。
- **响应**: `204 No Content`

### 计划审批 API
#### `GET /api/v1/plans/:planId/approvals`
- **描述**: 获取计划的审批状态列表。
- **响应**: `200 OK` - `[{ approval_object }, ...]`

#### `POST /api/v1/plans/:planId/approvals`
- **描述**: 提交/更新自己的审批状态。
- **请求体**: `{ "status": "approved", "comment": "..." }`
- **响应**: `201 Created` - `{ new_approval_object }`

### 计划版本 API
#### `GET /api/v1/plans/:planId/versions`
- **描述**: 获取计划的所有历史版本。
- **响应**: `200 OK` - `[{ version_object }, ...]`

#### `POST /api/v1/plans/:planId/versions`
- **描述**: 创建一个新的计划版本 (快照)。
- **请求体**: `{ title, description }`
- **响应**: `201 Created` - `{ new_version_object }`

### 计划动态 API
#### `GET /api/v1/plans/:planId/activities`
- **描述**: 获取计划的活动日志。
- **响应**: `200 OK` - `[{ activity_object }, ...]`

---

## 4. 路径与里程碑 API

### `POST /api/v1/plans/:planId/paths`
- **描述**: 为指定计划创建新的执行路径。
- **请求体**: `{ title, description?, ... }`
- **响应**: `201 Created` - `{ new_path_object }`

### `PUT /api/v1/paths/:pathId`
- **描述**: 更新指定ID的执行路径。
- **请求体**: `{ updated_path_data }`
- **响应**: `200 OK` - `{ updated_path_object }`

### `DELETE /api/v1/paths/:pathId`
- **描述**: 删除指定ID的执行路径。
- **响应**: `204 No Content`

### `POST /api/v1/paths/:pathId/milestones`
- **描述**: 为指定路径创建新的里程碑。
- **请求体**: `{ title, date?, ... }`
- **响应**: `201 Created` - `{ new_milestone_object }`

### `PUT /api/v1/milestones/:milestoneId`
- **描述**: 更新指定ID的里程碑。
- **请求体**: `{ updated_milestone_data }`
- **响应**: `200 OK` - `{ updated_milestone_object }`

### `DELETE /api/v1/milestones/:milestoneId`
- **描述**: 删除指定ID的里程碑。
- **响应**: `204 No Content` 