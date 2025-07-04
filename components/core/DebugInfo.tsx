'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export const DebugInfo: React.FC = () => {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    columns: 0
  })

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      let columns = 2 // 默认移动端
      if (width >= 1536) {
        columns = 5
      } else if (width >= 1024) {
        columns = 4
      } else if (width >= 768) {
        columns = 3
      } else {
        columns = 2 // 移动端强制2列
      }
      
      setScreenInfo({ width, height, columns })
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
    
    return () => window.removeEventListener('resize', updateScreenInfo)
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-50',
      'bg-black/80 text-white text-xs',
      'px-3 py-2 rounded-lg font-mono',
      'backdrop-blur-sm'
    )}>
      <div>宽度: {screenInfo.width}px</div>
      <div>高度: {screenInfo.height}px</div>
      <div>列数: {screenInfo.columns}</div>
      <div>断点: {
        screenInfo.width >= 1536 ? '2xl' :
        screenInfo.width >= 1024 ? 'lg' :
        screenInfo.width >= 768 ? 'md' : 'sm'
      }</div>
    </div>
  )
} 