请对Together页面进行以下具体的UI/UX优化，确保与项目整体设计语言保持一致：

## 1. 设计一致性优化
- **Header布局统一**: 将Together页面的header布局调整为与其他模块（如Plans页面）一致的设计风格，参考项目现有的导航栏设计模式
- **整体设计语言**: 确保页面遵循Apple Design规范和项目的设计系统，重点优化移动端体验（主力用户群体）
- **布局重新分配**: 在保持核心功能不变的前提下，重新组织页面布局以提升用户体验

## 2. 功能交互优化
- **财务记录添加方式**: 将"添加财务记录"从当前实现改为弹出模态框形式
- **待办事项添加方式**: 将"添加待办事项"从当前实现改为弹出模态框形式
- **财务记录权限选择**: 在财务记录模态框中添加身份选择功能，允许用户选择：
  - 以自己身份记账
  - 帮其他用户（如用户B）记账

## 3. UI组件优化
- **搜索框尺寸**: 扩大搜索框宽度，确保至少能显示合理长度的搜索内容（当前只能显示一个字符）
- **表单控件背景色**: 修复所有input框和select框的背景色问题：
  - 避免使用白色等浅色背景
  - 确保未选择选项的文字在背景上清晰可见
  - 在整个项目范围内搜索并修复类似的可访问性问题

## 4. 性能和加载优化
- **骨架屏实现**: 在需要数据加载的区域添加骨架屏效果
- **数据加载优化**: 优化频繁查询数据的逻辑，减少不必要的重复请求
- **防止重复刷新**: 在容易触发刷新的区域添加防抖机制，避免用户体验受影响

## 5. 测试功能添加
- **模拟协作伙伴按钮**: 在"与伙伴协作"按钮旁边添加一个测试专用按钮
  - 初始状态：无协作伙伴
  - 点击后：自动添加一个模拟协作伙伴用于测试
- **协作区域简化**: 拥有协作伙伴后简化"开始与伙伴协作"区域的UI，保留核心信息，释放更多页面空间

## 注意事项
- 只修改指定的功能和样式，不要改动无关的代码
- 优先考虑移动端用户体验
- 保持核心功能完整性
- 确保修改后的设计与项目整体风格一致