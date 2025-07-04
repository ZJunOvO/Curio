'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, TrendingUp, Hash } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { searchSuggestions, popularTags } from '@/lib/mock-data'

// TODO: P-26 - 从API获取真实的搜索建议和热门标签

export interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  showSuggestions?: boolean
}

const SearchBox = React.forwardRef<HTMLDivElement, SearchBoxProps>(
  ({ 
    value, 
    onChange, 
    placeholder = "搜索心愿...", 
    className,
    showSuggestions = true 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchHistory, setSearchHistory] = useState<string[]>([])
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
    const inputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 从localStorage加载搜索历史
    useEffect(() => {
      const saved = localStorage.getItem('curio-search-history')
      if (saved) {
        try {
          setSearchHistory(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load search history:', error)
        }
      }
    }, [])

    // 过滤搜索建议
    useEffect(() => {
      if (value.trim()) {
        const filtered = searchSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        )
        setFilteredSuggestions(filtered)
      } else {
        setFilteredSuggestions([])
      }
    }, [value])

    // 处理外部点击关闭
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange(newValue)
      setIsOpen(true)
    }

    const handleSearch = (searchTerm: string) => {
      if (!searchTerm.trim()) return

      // 添加到搜索历史
      const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('curio-search-history', JSON.stringify(newHistory))

      onChange(searchTerm)
      setIsOpen(false)
      inputRef.current?.blur()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && value.trim()) {
        handleSearch(value)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    const clearSearch = () => {
      onChange('')
      inputRef.current?.focus()
    }

    const clearHistory = () => {
      setSearchHistory([])
      localStorage.removeItem('curio-search-history')
    }

    const showDropdown = isOpen && showSuggestions && (
      filteredSuggestions.length > 0 || 
      searchHistory.length > 0 || 
      popularTags.length > 0
    )

    return (
      <div ref={containerRef} className={cn('relative', className)}>
        {/* 搜索输入框 */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400 z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className={cn(
              'pl-9 pr-10 py-2.5 text-sm rounded-xl',
              'border border-apple-gray-200 dark:border-apple-gray-700',
              'bg-white/80 dark:bg-apple-gray-900/80',
              'backdrop-blur-sm',
              'focus:bg-white dark:focus:bg-apple-gray-900',
              'focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20',
              'transition-all duration-200 ease-apple',
              'placeholder:text-apple-gray-400'
            )}
          />
          {value && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-apple-gray-400 hover:text-apple-gray-600 transition-colors duration-200"
              aria-label="清除搜索"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 搜索建议下拉框 */}
        {showDropdown && (
          <div className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-white dark:bg-apple-gray-900 rounded-xl shadow-apple-lg',
            'border border-apple-gray-100 dark:border-apple-gray-800',
            'max-h-80 overflow-y-auto scrollbar-hide',
            'animate-fade-in'
          )}>
            <div className="p-4 space-y-4">
              {/* 搜索建议 */}
              {filteredSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Search size={14} className="text-apple-gray-400" />
                    <span className="text-xs font-medium text-apple-gray-500 uppercase tracking-wide">
                      搜索建议
                    </span>
                  </div>
                  <div className="space-y-1">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm',
                          'text-apple-gray-700 dark:text-apple-gray-300',
                          'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800',
                          'transition-colors duration-200'
                        )}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 搜索历史 */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-apple-gray-400" />
                      <span className="text-xs font-medium text-apple-gray-500 uppercase tracking-wide">
                        最近搜索
                      </span>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-apple-gray-400 hover:text-apple-gray-600 transition-colors duration-200"
                    >
                      清除
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm',
                          'text-apple-gray-700 dark:text-apple-gray-300',
                          'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800',
                          'transition-colors duration-200'
                        )}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 热门标签 */}
              {!value && popularTags.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-apple-gray-400" />
                    <span className="text-xs font-medium text-apple-gray-500 uppercase tracking-wide">
                      热门标签
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 8).map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(tag)}
                        className={cn(
                          'inline-flex items-center gap-1 px-3 py-1.5',
                          'bg-apple-gray-50 dark:bg-apple-gray-800 rounded-full text-xs',
                          'text-apple-gray-600 dark:text-apple-gray-400',
                          'hover:bg-apple-blue hover:text-white',
                          'transition-all duration-200 ease-apple'
                        )}
                      >
                        <Hash size={10} />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

SearchBox.displayName = 'SearchBox'

export { SearchBox } 