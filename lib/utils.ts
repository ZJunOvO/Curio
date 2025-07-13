import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className，支持条件类名和去重
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * 生成随机ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成基于字符串的渐变背景类名
 */
export function generateGradient(title: string): string {
  const colors = [
    'from-purple-600 to-blue-600',
    'from-pink-500 to-rose-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-cyan-500'
  ]
  const index = title.charCodeAt(0) % colors.length
  return colors[index]
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 检测设备类型
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform));
};

/**
 * 检测iOS设备
 */
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * 移动端特殊复制方法
 */
const copyToClipboardMobile = async (text: string): Promise<CopyResult> => {
  const textToCopy = text.trim();
  
  // iOS特殊处理
  if (isIOSDevice()) {
    try {
      // 方法1: 尝试Clipboard API (iOS 13.4+)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        return {
          success: true,
          method: 'clipboard-api'
        };
      }
    } catch (error) {
      console.warn('iOS Clipboard API 失败:', error);
    }
    
    // 方法2: iOS execCommand方法
    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1px;
        height: 1px;
        padding: 0;
        border: none;
        outline: none;
        box-shadow: none;
        background: transparent;
        opacity: 0;
        pointer-events: none;
      `;
      textArea.setAttribute('readonly', 'readonly');
      textArea.setAttribute('contenteditable', 'true');
      
      document.body.appendChild(textArea);
      
      // iOS需要用户交互的上下文
      textArea.focus();
      textArea.setSelectionRange(0, textArea.value.length);
      
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        return {
          success: true,
          method: 'exec-command'
        };
      }
    } catch (error) {
      console.warn('iOS execCommand 失败:', error);
    }
  }
  
  // Android和其他移动设备
  try {
    // 创建临时input元素（移动端更可靠）
    const input = document.createElement('input');
    input.value = textToCopy;
    input.style.cssText = `
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      pointer-events: none;
      z-index: 9999;
    `;
    input.setAttribute('readonly', 'readonly');
    
    document.body.appendChild(input);
    
    // 聚焦并选择
    input.focus();
    input.select();
    input.setSelectionRange(0, input.value.length);
    
    // 短暂延迟确保选择生效
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const successful = document.execCommand('copy');
    document.body.removeChild(input);
    
    if (successful) {
      return {
        success: true,
        method: 'exec-command'
      };
    }
  } catch (error) {
    console.warn('移动端复制失败:', error);
  }
  
  return {
    success: false,
    method: 'fallback',
    error: '移动端复制功能受限，请长按链接手动复制'
  };
};

/**
 * 通用剪贴板复制工具函数
 * 支持多种复制方法，确保最大兼容性
 */
export interface CopyResult {
  success: boolean;
  method?: 'clipboard-api' | 'exec-command' | 'fallback';
  error?: string;
}

export const copyToClipboard = async (text: string): Promise<CopyResult> => {
  if (!text || text.trim() === '') {
    return {
      success: false,
      error: '没有可复制的内容'
    };
  }
  
  const textToCopy = text.trim();
  
  // 检查基本支持
  if (!navigator.clipboard && !document.execCommand) {
    return {
      success: false,
      error: '浏览器不支持复制功能'
    };
  }
  
  // 移动端特殊处理
  if (isMobileDevice()) {
    return await copyToClipboardMobile(textToCopy);
  }
  
  // 桌面端处理（原有逻辑）
  // 方法1: 现代 Clipboard API
  try {
    const isSecure = window.location.protocol === 'https:' || 
                    window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.isSecureContext;
    
    if (navigator.clipboard && isSecure) {
      await navigator.clipboard.writeText(textToCopy);
      return {
        success: true,
        method: 'clipboard-api'
      };
    }
  } catch (error) {
    console.warn('Clipboard API 失败:', error);
  }
  
  // 方法2: execCommand 备用方案
  try {
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    textArea.style.cssText = `
      position: fixed;
      left: -999999px;
      top: -999999px;
      opacity: 0;
      pointer-events: none;
      z-index: -1;
      white-space: pre;
    `;
    textArea.setAttribute('readonly', 'readonly');
    textArea.setAttribute('contenteditable', 'true');
    
    document.body.appendChild(textArea);
    
    // 确保元素被添加到DOM后再操作
    await new Promise(resolve => setTimeout(resolve, 10));
    
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      return {
        success: true,
        method: 'exec-command'
      };
    } else {
      throw new Error('execCommand 返回 false');
    }
  } catch (error) {
    console.warn('execCommand 失败:', error);
  }
  
  // 方法3: 完全失败
  return {
    success: false,
    method: 'fallback',
    error: '所有复制方法都失败了'
  };
};

/**
 * 检查剪贴板支持情况
 */
export const checkClipboardSupport = (): {
  hasClipboardAPI: boolean;
  hasExecCommand: boolean;
  isSecureContext: boolean;
  recommendedMethod: string;
  deviceType: 'desktop' | 'mobile';
  isIOS: boolean;
  userAgent: string;
} => {
  const isSecure = window.location.protocol === 'https:' || 
                  window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.isSecureContext;
  
  const hasClipboardAPI = !!navigator.clipboard && isSecure;
  const hasExecCommand = !!document.execCommand;
  const deviceType = isMobileDevice() ? 'mobile' : 'desktop';
  const isIOS = isIOSDevice();
  
  let recommendedMethod = 'none';
  if (deviceType === 'mobile') {
    if (isIOS && hasClipboardAPI) {
      recommendedMethod = 'clipboard-api';
    } else if (hasExecCommand) {
      recommendedMethod = 'exec-command';
    } else {
      recommendedMethod = 'manual';
    }
  } else {
    if (hasClipboardAPI) {
      recommendedMethod = 'clipboard-api';
    } else if (hasExecCommand) {
      recommendedMethod = 'exec-command';
    }
  }
  
  return {
    hasClipboardAPI,
    hasExecCommand,
    isSecureContext: isSecure,
    recommendedMethod,
    deviceType,
    isIOS,
    userAgent: navigator.userAgent
  };
}; 