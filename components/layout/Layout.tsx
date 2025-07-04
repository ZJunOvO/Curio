'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { Footer } from './Footer'

export interface LayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  containerized?: boolean
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  showHeader = true,
  showFooter = true,
  containerized = true
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      {/* 顶部导航 */}
      {showHeader && <Header />}
      
      {/* 主要内容区域 */}
      <main 
        className={cn(
          'flex-1 flex flex-col',
          containerized && 'container mx-auto px-4 sm:px-6 lg:px-8',
          !containerized && 'w-full',
          className
        )}
      >
        {children}
      </main>
      
      {/* 页脚 */}
      {showFooter && <Footer />}
    </div>
  )
}

Layout.displayName = 'Layout' 