import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { ToastProvider } from '@/components/ui/Toast'
import { CacheInitializer } from '@/components/cache/CacheInitializer'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '品镜 Curio - 管理你的心愿与灵感',
  description: '成为用户管理个人欲望、探索内在品味的第二大脑',
  keywords: ['心愿管理', '灵感收藏', '个人品味', '生活记录'],
  authors: [{ name: 'Curio Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-apple-gray-50 dark:bg-black antialiased">
        <Providers>
          <ToastProvider>
            <CacheInitializer />
            <div className="relative">
              {children}
            </div>
            <FloatingNav />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
} 