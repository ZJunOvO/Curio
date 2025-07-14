/**
 * 项目级数据缓存管理器
 * 提供内存缓存、本地存储缓存和缓存失效机制
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  version: number;
}

export interface CacheConfig {
  ttl?: number; // 生存时间（毫秒）
  useLocalStorage?: boolean; // 是否使用localStorage持久化
  maxMemoryItems?: number; // 内存缓存最大条目数
}

export class DataCache {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟
  private maxMemoryItems = 100; // 默认最多缓存100项
  private version = 1; // 缓存版本，用于强制失效

  constructor(private config: CacheConfig = {}) {
    this.defaultTTL = config.ttl || this.defaultTTL;
    this.maxMemoryItems = config.maxMemoryItems || this.maxMemoryItems;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry,
      version: this.version
    };

    // 内存缓存
    this.memoryCache.set(key, item);
    this.enforceMemoryLimit();

    // 本地存储缓存
    if (this.config.useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (error) {
        console.warn('无法写入localStorage:', error);
      }
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    // 先检查内存缓存
    let item = this.memoryCache.get(key);
    
    // 如果内存中没有，检查本地存储
    if (!item && this.config.useLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // 如果数据仍然有效，放回内存缓存
          if (item && this.isValid(item)) {
            this.memoryCache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('无法读取localStorage:', error);
      }
    }

    if (!item || !this.isValid(item)) {
      this.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    
    if (this.config.useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        console.warn('无法删除localStorage项:', error);
      }
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.memoryCache.clear();
    
    if (this.config.useLocalStorage && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('无法清空localStorage:', error);
      }
    }
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 获取或设置缓存（如果不存在则调用工厂函数）
   */
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * 使特定键的缓存失效
   */
  invalidate(pattern: string | RegExp): void {
    const keys = Array.from(this.memoryCache.keys());
    const toDelete: string[] = [];

    if (typeof pattern === 'string') {
      toDelete.push(...keys.filter(key => key.includes(pattern)));
    } else {
      toDelete.push(...keys.filter(key => pattern.test(key)));
    }

    toDelete.forEach(key => this.delete(key));
  }

  /**
   * 更新缓存版本（使所有缓存失效）
   */
  incrementVersion(): void {
    this.version++;
    this.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memoryItems: number;
    totalSize: number;
    hitRate: number;
  } {
    return {
      memoryItems: this.memoryCache.size,
      totalSize: this.calculateMemorySize(),
      hitRate: 0 // TODO: 实现命中率统计
    };
  }

  /**
   * 检查缓存项是否有效
   */
  private isValid(item: CacheItem<any>): boolean {
    return (
      item.version === this.version &&
      Date.now() < item.expiry
    );
  }

  /**
   * 强制执行内存限制
   */
  private enforceMemoryLimit(): void {
    if (this.memoryCache.size <= this.maxMemoryItems) {
      return;
    }

    // 按时间戳排序，删除最旧的项
    const entries = Array.from(this.memoryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toDelete = entries.slice(0, entries.length - this.maxMemoryItems);
    toDelete.forEach(([key]) => this.memoryCache.delete(key));
  }

  /**
   * 计算内存使用量（近似值）
   */
  private calculateMemorySize(): number {
    let size = 0;
    this.memoryCache.forEach((item, key) => {
      size += key.length * 2; // 键的大小
      size += JSON.stringify(item).length * 2; // 值的大小（近似）
    });
    return size;
  }
}

// 创建全局缓存实例
export const globalCache = new DataCache({
  ttl: 10 * 60 * 1000, // 10分钟
  useLocalStorage: true,
  maxMemoryItems: 200
});

// 特定用途的缓存实例
export const planCache = new DataCache({
  ttl: 15 * 60 * 1000, // 15分钟，计划数据缓存时间较长
  useLocalStorage: true,
  maxMemoryItems: 50
});

export const userCache = new DataCache({
  ttl: 30 * 60 * 1000, // 30分钟，用户数据变化较少
  useLocalStorage: true,
  maxMemoryItems: 20
});

export const wishCache = new DataCache({
  ttl: 5 * 60 * 1000, // 5分钟，心愿数据可能频繁变化
  useLocalStorage: false, // 心愿数据不需要持久化
  maxMemoryItems: 100
});