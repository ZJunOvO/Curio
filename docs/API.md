# API 文档 (API.md)

> **P-26 待办事项**: 设计和实现 RESTful API 以支持品镜(Curio)应用的前后端数据交互。

## API 设计原则
- **RESTful**: 遵循 RESTful 架构风格。
- **JSON**: 所有数据交换使用 JSON 格式。
- **认证**: 使用 JWT (JSON Web Tokens) 进行无状态认证。
- **错误处理**: 标准化的错误响应格式。
- **版本控制**: API 通过 URL 进行版本控制 (e.g., `/api/v1/...`)。

## 认证

### `POST /api/v1/auth/register`
- **描述**: 注册新用户。
- **请求体**: `{ "email": "...", "password": "..." }`
- **响应**: `{ "token": "...", "user": { ... } }`

### `POST /api/v1/auth/login`
- **描述**: 用户登录。
- **请求体**: `{ "email": "...", "password": "..." }`
- **响应**: `{ "token": "...", "user": { ... } }`

---

## 计划 API (Plans)

### `GET /api/v1/plans`
- **描述**: 获取当前用户的所有计划。
- **认证**: 需要。
- **查询参数**:
  - `status`: 'draft', 'active', etc.
  - `priority`: 'high', 'medium', etc.
  - `sortBy`: 'createdAt', 'updatedAt', 'title'
  - `search`: 搜索查询字符串
- **响应**: `[{ plan_object }, ...]`

### `POST /api/v1/plans`
- **描述**: 创建一个新计划。
- **认证**: 需要。
- **请求体**: `{ plan_data }`
- **响应**: `{ new_plan_object }`

### `GET /api/v1/plans/:id`
- **描述**: 获取指定ID的计划详情。
- **认证**: 需要。
- **响应**: `{ plan_object_with_details }`

### `PUT /api/v1/plans/:id`
- **描述**: 更新指定ID的计划。
- **认证**: 需要。
- **请求体**: `{ updated_plan_data }`
- **响应**: `{ updated_plan_object }`

### `DELETE /api/v1/plans/:id`
- **描述**: 删除指定ID的计划。
- **认证**: 需要。
- **响应**: `204 No Content`

---

## 执行路径 API (Paths) - (嵌套在计划下)

### `POST /api/v1/plans/:planId/paths`
- **描述**: 为指定计划创建新的执行路径。
- **认证**: 需要。
- **请求体**: `{ path_data }`
- **响应**: `{ new_path_object }`

### `PUT /api/v1/paths/:pathId`
- **描述**: 更新指定ID的执行路径。
- **认证**: 需要。
- **请求体**: `{ updated_path_data }`
- **响应**: `{ updated_path_object }`

### `DELETE /api/v1/paths/:pathId`
- **描述**: 删除指定ID的执行路径。
- **认证**: 需要。
- **响应**: `204 No Content`

---

## 里程碑 API (Milestones) - (嵌套在路径下)

### `POST /api/v1/paths/:pathId/milestones`
- **描述**: 为指定路径创建新的里程碑。
- **认证**: 需要。
- **请求体**: `{ milestone_data }`
- **响应**: `{ new_milestone_object }`

### `PUT /api/v1/milestones/:milestoneId`
- **描述**: 更新指定ID的里程碑。
- **认证**: 需要。
- **请求体**: `{ updated_milestone_data }`
- **响应**: `{ updated_milestone_object }`

### `DELETE /api/v1/milestones/:milestoneId`
- **描述**: 删除指定ID的里程碑。
- **认证**: 需要。
- **响应**: `204 No Content` 