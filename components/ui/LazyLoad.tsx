'use client';

import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { Skeleton } from './Skeleton';

export interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  className?: string;
  once?: boolean;
}

/**
 * 通用懒加载组件
 * 使用 Intersection Observer API 实现元素的懒加载
 */
export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  root = null,
  rootMargin = '50px',
  className,
  once = true
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              setHasLoaded(true);
              observer.unobserve(element);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        root,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, root, rootMargin, once]);

  const shouldRender = once ? (isVisible || hasLoaded) : isVisible;

  return (
    <div ref={elementRef} className={className}>
      {shouldRender ? children : fallback}
    </div>
  );
}

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 懒加载图片组件
 */
export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  fallback,
  onLoad,
  onError
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const defaultFallback = (
    <Skeleton 
      className={className}
      width={width}
      height={height}
    />
  );

  return (
    <LazyLoad fallback={fallback || defaultFallback}>
      <div className="relative">
        {!imageLoaded && !imageError && (
          <Skeleton 
            className={`absolute inset-0 ${className}`}
            width={width}
            height={height}
          />
        )}
        
        {!imageError && (
          <img
            src={src}
            alt={alt}
            className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        )}
        
        {imageError && placeholder && (
          <img
            src={placeholder}
            alt={alt}
            className={className}
            width={width}
            height={height}
          />
        )}
      </div>
    </LazyLoad>
  );
}

export interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  threshold?: number;
  className?: string;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

/**
 * 虚拟化列表组件
 * 适用于大量数据的列表渲染
 */
export function LazyList<T>({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  threshold = 5,
  className,
  loadingComponent,
  emptyComponent
}: LazyListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  if (items.length === 0) {
    return (
      <div className={className}>
        {emptyComponent || <div className="text-center text-gray-400 py-8">暂无数据</div>}
      </div>
    );
  }

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - threshold);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemsCount + threshold * 2);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(startIndex, endIndex + 1).map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loadingComponent?: ReactNode;
  className?: string;
}

/**
 * 无限滚动组件
 */
export function InfiniteScroll({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
  loadingComponent,
  className
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [loading, hasMore, onLoadMore]);

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="ml-2 text-gray-400">加载中...</span>
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {hasMore && (
        <div ref={sentinelRef} style={{ height: threshold }}>
          {loading && (loadingComponent || defaultLoadingComponent)}
        </div>
      )}
    </div>
  );
}

export default LazyLoad;