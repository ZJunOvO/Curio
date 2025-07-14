/**
 * 分类映射工具
 * 用于将英文分类代码转换为中文显示名称
 */

export const categoryDisplayMap: Record<string, string> = {
  // 计划分类
  personal: '个人成长',
  career: '职业发展',
  learning: '学习提升',
  health: '健康生活',
  finance: '财务管理',
  travel: '旅行探索',
  project: '项目管理',
  research: '学术研究',
  event: '活动策划',
  creative: '创意设计',
  general: '通用',
  
  // 心愿分类
  '数码科技': '数码科技',
  '旅行体验': '旅行体验',
  '时尚配饰': '时尚配饰',
  '家居装饰': '家居装饰',
  '健康生活': '健康生活',
  '技能提升': '技能提升',
  '交通工具': '交通工具',
  '兴趣爱好': '兴趣爱好',
  
  // 财务分类
  '餐饮': '餐饮',
  '交通': '交通',
  '娱乐': '娱乐',
  '购物': '购物',
  '健康': '健康',
  '住房': '住房',
  '教育': '教育',
  '工资': '工资',
  '其他': '其他'
};

/**
 * 获取分类的中文显示名称
 * @param category 分类代码或名称
 * @returns 中文显示名称
 */
export function getCategoryDisplayName(category: string | undefined): string {
  if (!category) return '未分类';
  
  // 如果已经是中文，直接返回
  if (categoryDisplayMap[category]) {
    return categoryDisplayMap[category];
  }
  
  // 如果是英文代码，进行映射
  const mapped = categoryDisplayMap[category];
  if (mapped) {
    return mapped;
  }
  
  // 如果没有映射，返回原始值（首字母大写）
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * 获取预算显示格式
 * @param totalBudget 总预算
 * @param spentBudget 已用预算
 * @returns 格式化的预算显示字符串
 */
export function getBudgetDisplayFormat(totalBudget?: number, spentBudget?: number): string {
  if (!totalBudget || totalBudget <= 0) {
    return '未设置';
  }
  
  // 新格式：只显示总预算，不显示使用进度
  return `预算 ¥${totalBudget.toLocaleString()}`;
}