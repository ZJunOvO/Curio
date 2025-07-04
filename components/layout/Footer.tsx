'use client'

import React from 'react'
import { Link } from '@heroui/react'
import { 
  Heart, 
  Twitter, 
  Github, 
  Mail, 
  ExternalLink 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: {
      title: '产品',
      links: [
        { label: '功能介绍', href: '/features' },
        { label: '更新日志', href: '/changelog' },
        { label: '路线图', href: '/roadmap' },
        { label: '定价', href: '/pricing' },
      ]
    },
    support: {
      title: '支持',
      links: [
        { label: '帮助中心', href: '/help' },
        { label: '联系我们', href: '/contact' },
        { label: '反馈建议', href: '/feedback' },
        { label: 'API文档', href: '/docs' },
      ]
    },
    company: {
      title: '公司',
      links: [
        { label: '关于我们', href: '/about' },
        { label: '博客', href: '/blog' },
        { label: '隐私政策', href: '/privacy' },
        { label: '服务条款', href: '/terms' },
      ]
    }
  }

  const socialLinks = [
    { 
      label: 'Twitter', 
      href: 'https://twitter.com/curio', 
      icon: Twitter,
      color: 'hover:text-blue-400'
    },
    { 
      label: 'GitHub', 
      href: 'https://github.com/curio', 
      icon: Github,
      color: 'hover:text-apple-gray-900 dark:hover:text-white'
    },
    { 
      label: '邮箱', 
      href: 'mailto:hello@curio.app', 
      icon: Mail,
      color: 'hover:text-apple-blue'
    },
  ]

  return (
    <footer className={cn(
      'bg-apple-gray-50 dark:bg-apple-gray-950',
      'border-t border-apple-gray-100 dark:border-apple-gray-800',
      'mt-auto',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 主要内容区域 */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 品牌区域 */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-apple-lg bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center shadow-apple">
                  <Heart className="w-5 h-5 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="font-semibold text-xl text-apple-gray-900 dark:text-white">
                    品镜
                  </div>
                  <div className="text-xs text-apple-gray-500">
                    Curio
                  </div>
                </div>
              </div>
              <p className="text-apple-gray-600 dark:text-apple-gray-400 text-sm leading-6 mb-6">
                成为用户管理个人欲望、探索内在品味的"第二大脑"，通过极致优雅的工具体验，将零散的灵感转化为可被感知的、成体系的个人风格。
              </p>
              
              {/* 社交链接 */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={social.label}
                      href={social.href}
                      isExternal
                      className={cn(
                        'p-2 rounded-apple transition-all duration-200',
                        'text-apple-gray-400 hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
                        social.color
                      )}
                      aria-label={social.label}
                    >
                      <IconComponent size={18} />
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* 链接分组 */}
            {Object.values(footerLinks).map((group) => (
              <div key={group.title} className="col-span-1">
                <h3 className="font-semibold text-apple-gray-900 dark:text-white mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-apple-gray-600 dark:text-apple-gray-400 hover:text-apple-gray-900 dark:hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 底部版权区域 */}
        <div className="py-6 border-t border-apple-gray-100 dark:border-apple-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-sm text-apple-gray-500">
              © {currentYear} 品镜 Curio. 保留所有权利.
            </div>
            
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white transition-colors"
              >
                隐私政策
              </Link>
              <Link
                href="/terms"
                className="text-sm text-apple-gray-500 hover:text-apple-gray-900 dark:hover:text-white transition-colors"
              >
                服务条款
              </Link>
              <div className="text-sm text-apple-gray-400 flex items-center gap-1">
                Made with <Heart size={12} className="text-apple-red" fill="currentColor" /> in China
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

 