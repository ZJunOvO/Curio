'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface MasonryGridProps {
  children: React.ReactNode[]
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ 
    children, 
    columns = { sm: 2, md: 3, lg: 4, xl: 5 },
    gap = 16,
    className 
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [columnCount, setColumnCount] = useState(2) // 默认移动端2列
    
    // 精确的响应式列数计算 - 确保移动端2列
    useEffect(() => {
      if (!containerRef.current) return

      const updateColumns = () => {
        const width = window.innerWidth // 使用window.innerWidth而不是容器宽度
        
        // 精确的断点控制
        if (width >= 1536) { // 2xl
          setColumnCount(columns.xl || 5)
        } else if (width >= 1024) { // lg - 桌面
          setColumnCount(columns.lg || 4)
        } else if (width >= 768) { // md - 平板
          setColumnCount(columns.md || 3)
        } else { // sm - 手机，严格2列
          setColumnCount(2) // 强制移动端2列
        }
      }

      // 初始化
      updateColumns()

      // 监听窗口大小变化
      window.addEventListener('resize', updateColumns)
      
      return () => {
        window.removeEventListener('resize', updateColumns)
      }
    }, [columns])

    // 优化的瀑布流算法 - 创造更大的高度差
    const getColumnChildren = () => {
      const columnChildren: React.ReactNode[][] = Array.from(
        { length: columnCount }, 
        () => []
      )
      
      // 为每列设置不同的初始权重，创造高度差
      const columnWeights = Array.from({ length: columnCount }, (_, index) => {
        // 第一列权重最低，最后一列权重最高，创造阶梯效果
        return index * 2 + Math.random() * 3 // 添加随机性增加自然感
      })

      children.forEach((child, index) => {
        // 找到权重最小的列
        const lightestColumnIndex = columnWeights.indexOf(Math.min(...columnWeights))
        columnChildren[lightestColumnIndex].push(child)
        
        // 增加该列的权重，模拟高度增长
        // 为不同位置的卡片设置不同的权重增长值
        const weightIncrease = index < columnCount ? 
          (3 + Math.random() * 2) : // 第一行卡片权重增长较大
          (1 + Math.random() * 1.5)   // 后续卡片权重增长较小
        
        columnWeights[lightestColumnIndex] += weightIncrease
      })

      return columnChildren
    }

    const columnChildren = getColumnChildren()

    // 响应式间距
    const responsiveGap = columnCount === 2 ? Math.max(gap, 10) : gap

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
      >
        <div
          ref={containerRef}
          className="flex items-start justify-center"
          style={{ gap: `${responsiveGap}px` }}
        >
          {columnChildren.map((columnItems, columnIndex) => (
            <div
              key={columnIndex}
              className="flex-1 flex flex-col max-w-none"
              style={{ gap: `${responsiveGap}px` }}
            >
              {columnItems.map((child, itemIndex) => (
                <div
                  key={`${columnIndex}-${itemIndex}`}
                  className="animate-fade-in w-full"
                  style={{
                    animationDelay: `${(itemIndex * 100) + (columnIndex * 50)}ms`
                  }}
                >
                  {child}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }
)

MasonryGrid.displayName = 'MasonryGrid'

export { MasonryGrid } 