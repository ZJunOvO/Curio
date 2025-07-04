import { WishItem } from '@/components/core'

export const mockWishes: WishItem[] = [
  {
    id: '1',
    title: 'Apple MacBook Pro 16" M3 Max',
    description: '新一代 MacBook Pro，搭载 M3 Max 芯片，性能强劲，适合专业创作工作。',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    sourceUrl: 'https://www.apple.com/macbook-pro/',
    tags: ['数码产品', '笔记本', '工作'],
    category: '数码科技',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    isFavorite: true
  },
  {
    id: '2',
    title: '日本京都赏樱之旅',
    description: '想要在春天的时候去京都看樱花，感受日本传统文化的魅力，特别是清水寺和哲学之道。漫步在樱花飞舞的小径上，体验和风之美。',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&q=80',
    sourceUrl: 'https://www.japan.travel/en/destinations/kansai/kyoto/',
    tags: ['旅行', '日本', '赏樱', '文化'],
    category: '旅行体验',
    priority: 'medium',
    createdAt: new Date('2024-01-10'),
    isFavorite: false
  },
  {
    id: '3',
    title: 'Hermès Kelly 25 手袋',
    description: '经典的 Kelly 包，优雅简约的设计。',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    sourceUrl: 'https://www.hermes.com',
    tags: ['奢侈品', '手袋', '时尚'],
    category: '时尚配饰',
    priority: 'high',
    createdAt: new Date('2024-01-08'),
    isFavorite: true
  },
  {
    id: '4',
    title: '北欧风实木餐桌',
    description: '简约的北欧设计风格，天然橡木材质，适合小户型的温馨用餐空间。环保材质，手工打磨。',
    imageUrl: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80',
    sourceUrl: 'https://www.ikea.com',
    tags: ['家具', '北欧风', '餐厅'],
    category: '家居装饰',
    priority: 'medium',
    createdAt: new Date('2024-01-12'),
    isFavorite: false
  },
  {
    id: '5',
    title: '瑜伽私教课程',
    description: '想要开始规律的瑜伽练习。',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    tags: ['健康', '瑜伽', '运动'],
    category: '健康生活',
    priority: 'low',
    createdAt: new Date('2024-01-14'),
    isFavorite: false
  },
  {
    id: '6',
    title: 'AirPods Pro 2',
    description: '苹果最新的降噪耳机，音质出色，通勤和工作时的完美伴侣。主动降噪技术，空间音频体验。',
    imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&q=80',
    sourceUrl: 'https://www.apple.com/airpods-pro/',
    tags: ['数码产品', '耳机', '音频'],
    category: '数码科技',
    priority: 'medium',
    createdAt: new Date('2024-01-11'),
    isFavorite: true
  },
  {
    id: '7',
    title: '普罗旺斯薰衣草田',
    description: '夏天想去法国普罗旺斯的薰衣草田，感受浪漫的紫色海洋。',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&q=80',
    sourceUrl: 'https://www.provence-guide.net',
    tags: ['旅行', '法国', '薰衣草', '浪漫'],
    category: '旅行体验',
    priority: 'medium',
    createdAt: new Date('2024-01-09'),
    isFavorite: false
  },
  {
    id: '8',
    title: '咖啡拉花课程',
    imageUrl: 'https://images.unsplash.com/photo-1495774856032-8b90bbb32b32?w=400&q=80',
    tags: ['技能学习', '咖啡', '手作'],
    category: '技能提升',
    priority: 'low',
    createdAt: new Date('2024-01-13'),
    isFavorite: false
  },
  {
    id: '9',
    title: 'Tesla Model Y',
    description: '环保的电动车，先进的自动驾驶技术，代表未来出行方式。智能座舱，超长续航里程。',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80',
    sourceUrl: 'https://www.tesla.com/modely',
    tags: ['汽车', '电动车', '科技'],
    category: '交通工具',
    priority: 'high',
    createdAt: new Date('2024-01-07'),
    isFavorite: true
  },
  {
    id: '10',
    title: '植物标本制作工具套装',
    description: '制作美丽的植物标本，记录四季的变化。',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    tags: ['手工', '植物', '艺术'],
    category: '兴趣爱好',
    priority: 'low',
    createdAt: new Date('2024-01-06'),
    isFavorite: false
  },
  {
    id: '11',
    title: 'Nikon Z9 相机',
    description: '专业级无反相机，8K视频录制，完美的创作工具。45.7MP全画幅传感器，双EXPEED 7处理器。',
    imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80',
    sourceUrl: 'https://www.nikon.com',
    tags: ['摄影', '相机', '专业'],
    category: '数码科技',
    priority: 'high',
    createdAt: new Date('2024-01-05'),
    isFavorite: true
  },
  {
    id: '12',
    title: '冰岛极光之旅',
    description: '在冰岛追寻北极光。',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    sourceUrl: 'https://www.visiticeland.com',
    tags: ['旅行', '冰岛', '极光', '自然'],
    category: '旅行体验',
    priority: 'medium',
    createdAt: new Date('2024-01-04'),
    isFavorite: false
  },
  {
    id: '13',
    title: '意式咖啡机',
    description: '专业级半自动咖啡机，在家享受咖啡馆级别的espresso。意大利进口，精准温控。',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80',
    tags: ['咖啡', '家电', '生活'],
    category: '家居装饰',
    priority: 'medium',
    createdAt: new Date('2024-01-03'),
    isFavorite: true
  },
  {
    id: '14',
    title: '钢琴课程',
    imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&q=80',
    tags: ['音乐', '钢琴', '学习'],
    category: '技能提升',
    priority: 'low',
    createdAt: new Date('2024-01-02'),
    isFavorite: false
  },
  {
    id: '15',
    title: '智能健身镜',
    description: '家庭健身的革命性产品，AI私教指导，实时姿态纠正。多种运动模式，科学训练计划。',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    tags: ['健身', '智能', '科技'],
    category: '健康生活',
    priority: 'medium',
    createdAt: new Date('2024-01-01'),
    isFavorite: false
  },
  {
    id: '16',
    title: 'Lego建筑系列',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    tags: ['玩具', '建筑', '收藏'],
    category: '兴趣爱好',
    priority: 'low',
    createdAt: new Date('2023-12-30'),
    isFavorite: true
  }
]

export const wishCategories = [
  '全部',
  '数码科技',
  '旅行体验', 
  '时尚配饰',
  '家居装饰',
  '健康生活',
  '技能提升',
  '交通工具',
  '兴趣爱好'
]

// 搜索建议关键词
export const searchSuggestions = [
  '日本旅行',
  'Apple产品',
  '健身器材',
  '咖啡相关',
  '摄影设备',
  '时尚单品',
  '技能学习',
  '智能家居',
  '奢侈品',
  '北欧风格'
]

// 热门标签
export const popularTags = [
  '数码产品',
  '旅行',
  '时尚',
  '健康',
  '学习',
  '咖啡',
  '摄影',
  '艺术',
  '科技',
  '生活'
] 