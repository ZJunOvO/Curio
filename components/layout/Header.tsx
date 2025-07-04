'use client'

import React, { useState } from 'react'
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Input
} from '@heroui/react'
import { useTheme } from 'next-themes'
import { 
  Search, 
  Plus, 
  Heart, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut,
  Star,
  Calendar,
  Home
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const menuItems = [
    { key: 'home', label: '首页', href: '/', icon: Home },
    { key: 'plans', label: '计划', href: '/plans', icon: Calendar },
    { key: 'wishes', label: '心愿', href: '/wishes', icon: Heart },
    { key: 'collections', label: '收藏', href: '/collections', icon: Star },
  ]

  const userMenuItems = [
    { key: 'profile', label: '个人资料', icon: User },
    { key: 'settings', label: '设置', icon: Settings },
    { key: 'logout', label: '退出登录', icon: LogOut },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: cn(
          'bg-white/80 dark:bg-black/80 backdrop-blur-md',
          'border-b border-apple-gray-100 dark:border-apple-gray-800',
          'shadow-apple-sm',
          className
        ),
        wrapper: 'px-4 sm:px-6 lg:px-8 max-w-7xl',
        content: 'gap-4'
      }}
      height="4rem"
      isBordered={false}
      isMenuOpen={isMenuOpen}
    >
      {/* 移动端菜单切换 */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          className="text-apple-gray-600 dark:text-apple-gray-400"
        />
      </NavbarContent>

      {/* 品牌Logo */}
      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-apple bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="font-semibold text-apple-gray-900 dark:text-white">
              品镜
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* 桌面端品牌和导航 */}
      <NavbarContent className="hidden sm:flex gap-8" justify="start">
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-apple-lg bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center shadow-apple">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <span className="font-semibold text-xl text-apple-gray-900 dark:text-white">
                品镜
              </span>
              <div className="text-xs text-apple-gray-500">
                Curio
              </div>
            </div>
          </Link>
        </NavbarBrand>

        {/* 桌面端导航菜单 */}
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <NavbarItem key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-apple transition-all duration-200',
                  'text-apple-gray-600 hover:text-apple-gray-900',
                  'dark:text-apple-gray-400 dark:hover:text-white',
                  'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800'
                )}
              >
                <IconComponent size={16} />
                <span>{item.label}</span>
              </Link>
            </NavbarItem>
          )
        })}
      </NavbarContent>

      {/* 右侧操作区 */}
      <NavbarContent justify="end">
        {/* 搜索框 */}
        <NavbarItem className="hidden lg:flex">
          <Input
            placeholder="搜索心愿..."
            size="sm"
            startContent={<Search size={16} className="text-apple-gray-400" />}
            classNames={{
              base: 'w-64',
              inputWrapper: 'bg-apple-gray-50 dark:bg-apple-gray-800 border-none shadow-apple-sm'
            }}
          />
        </NavbarItem>

        {/* 快速添加按钮 */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="flat"
            className="bg-apple-blue text-white hover:bg-apple-blue/90"
            aria-label="添加心愿"
          >
            <Plus size={16} />
          </Button>
        </NavbarItem>

        {/* 主题切换 */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            onPress={toggleTheme}
            className="text-apple-gray-600 dark:text-apple-gray-400"
            aria-label="切换主题"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </NavbarItem>

        {/* 用户菜单 */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                size="sm"
                src="/api/placeholder/32/32"
                name="用户"
              />
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="用户菜单"
              classNames={{
                base: 'p-1 bg-white dark:bg-apple-gray-900 shadow-apple-lg border border-apple-gray-100 dark:border-apple-gray-800'
              }}
            >
              {userMenuItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <DropdownItem
                    key={item.key}
                    startContent={<IconComponent size={16} />}
                    className={cn(
                      'text-apple-gray-700 dark:text-apple-gray-300',
                      item.key === 'logout' && 'text-apple-red dark:text-apple-red'
                    )}
                  >
                    {item.label}
                  </DropdownItem>
                )
              })}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      {/* 移动端菜单 */}
      <NavbarMenu
        className="bg-white/95 dark:bg-black/95 backdrop-blur-md border-r border-apple-gray-100 dark:border-apple-gray-800"
      >
        {/* 移动端搜索 */}
        <NavbarMenuItem>
          <Input
            placeholder="搜索心愿..."
            size="lg"
            startContent={<Search size={20} className="text-apple-gray-400" />}
            classNames={{
              inputWrapper: 'bg-apple-gray-50 dark:bg-apple-gray-800 border-none shadow-apple-sm'
            }}
          />
        </NavbarMenuItem>

        {/* 移动端导航链接 */}
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <NavbarMenuItem key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-apple transition-all duration-200',
                  'text-apple-gray-700 hover:text-apple-gray-900',
                  'dark:text-apple-gray-300 dark:hover:text-white',
                  'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800'
                )}
                size="lg"
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </Link>
            </NavbarMenuItem>
          )
        })}

        {/* 移动端用户菜单 */}
        <NavbarMenuItem>
          <div className="border-t border-apple-gray-100 dark:border-apple-gray-800 pt-4 mt-4">
            {userMenuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.key}
                  href="#"
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-apple transition-all duration-200',
                    'text-apple-gray-700 hover:text-apple-gray-900',
                    'dark:text-apple-gray-300 dark:hover:text-white',
                    'hover:bg-apple-gray-50 dark:hover:bg-apple-gray-800',
                    item.key === 'logout' && 'text-apple-red dark:text-apple-red'
                  )}
                  size="lg"
                >
                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  )
}

Header.displayName = 'Header' 