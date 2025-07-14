'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
  animate?: boolean;
}

export function Skeleton({ 
  className, 
  height, 
  width, 
  circle = false, 
  animate = true 
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]',
    circle ? 'rounded-full' : 'rounded-lg',
    animate && 'animate-[shimmer_2s_infinite]',
    className
  );

  const style = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <div 
      className={baseClasses}
      style={style}
    />
  );
}

// 计划详情页骨架屏
export function PlanDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 英雄区域骨架 */}
      <div className="relative h-96 overflow-hidden">
        <Skeleton className="absolute inset-0" />
        
        {/* 顶部操作栏 */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
          <Skeleton className="w-20 h-10" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-24 h-10" />
            <Skeleton className="w-16 h-10" />
          </div>
        </div>

        {/* 标题信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container mx-auto">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <Skeleton className="w-96 h-12" />
                <Skeleton className="w-80 h-6" />
                
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="w-32 h-5" />
                  <Skeleton className="w-28 h-5" />
                  <Skeleton className="w-20 h-5" />
                </div>
              </div>

              <Skeleton circle className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>

      {/* 导航标签骨架 */}
      <div className="container mx-auto px-8 py-6">
        <div className="flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-xl p-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
      </div>

      {/* 内容区域骨架 */}
      <div className="container mx-auto px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧内容 */}
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <Skeleton className="w-48 h-6 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-4/5 h-4" />
                  <Skeleton className="w-3/5 h-4" />
                </div>
              </div>
            ))}
          </div>

          {/* 右侧信息 */}
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <Skeleton className="w-32 h-5 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="w-full h-4" />
                  <Skeleton className="w-2/3 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 计划列表页骨架屏
export function PlanListSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 头部骨架 */}
      <div className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="w-48 h-8" />
          <Skeleton className="w-32 h-10" />
        </div>

        {/* 筛选器骨架 */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-40 h-10" />
          <Skeleton className="w-32 h-10" />
          <Skeleton className="w-28 h-10" />
        </div>

        {/* 计划卡片网格骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <Skeleton className="w-full h-40 mb-4" />
              <Skeleton className="w-3/4 h-6 mb-2" />
              <Skeleton className="w-full h-4 mb-4" />
              
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-16 h-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 通用内容骨架屏
export function ContentSkeleton({ 
  lines = 3, 
  className 
}: { 
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/5' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton({ 
  className,
  showImage = true,
  showActions = true 
}: {
  className?: string;
  showImage?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className={cn('p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10', className)}>
      {showImage && <Skeleton className="w-full h-40 mb-4" />}
      <Skeleton className="w-3/4 h-6 mb-2" />
      <ContentSkeleton lines={2} className="mb-4" />
      {showActions && (
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-6" />
          <Skeleton className="w-16 h-6" />
        </div>
      )}
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({ 
  rows = 5,
  columns = 4,
  className 
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 表头 */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
      
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;