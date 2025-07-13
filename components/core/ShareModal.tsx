'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Download, 
  FileText, 
  Image, 
  Link, 
  Copy, 
  Check,
  Loader,
  QrCode,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn, copyToClipboard, checkClipboardSupport, isMobileDevice } from '@/lib/utils';
import { type Plan } from '@/lib/mock-plans';
import { toast } from '@/lib/stores/useToastStore';
import { exportToPDF, exportToImage, generateShareLink } from '@/lib/export-utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

interface ShareOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void> | void;
  variant: 'export' | 'share';
  disabled?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, plan }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // 设备检测
  const isMobile = isMobileDevice();

  // 生成分享链接
  const handleGenerateShareLink = async () => {
    setLoading('link');
    try {
      const link = await generateShareLink(plan);
      setShareLink(link);
      toast.success('分享链接已生成', '任何人都可以通过此链接查看您的计划');
    } catch (error) {
      toast.error('生成失败', '无法生成分享链接，请稍后重试');
    } finally {
      setLoading(null);
    }
  };

  // 导出为PDF
  const handleExportToPDF = async () => {
    setLoading('pdf');
    try {
      await exportToPDF(plan, shareLink || undefined);
      toast.success('PDF导出成功', '文件已保存到下载文件夹');
    } catch (error) {
      toast.error('导出失败', '无法导出PDF文件，请稍后重试');
    } finally {
      setLoading(null);
    }
  };

  // 导出为图片
  const handleExportToImage = async (format: 'png' | 'jpeg') => {
    setLoading(format);
    try {
      await exportToImage(plan, format, shareLink || undefined);
      toast.success(`${format.toUpperCase()}导出成功`, '文件已保存到下载文件夹');
    } catch (error) {
      toast.error('导出失败', `无法导出${format.toUpperCase()}文件，请稍后重试`);
    } finally {
      setLoading(null);
    }
  };

  // 复制分享链接 - 增强移动端支持
  const copyShareLink = async () => {
    if (!shareLink) {
      console.warn('没有分享链接可复制');
      toast.error('复制失败', '没有可复制的分享链接');
      return;
    }
    
    console.log('准备复制的文本:', shareLink, '设备类型:', isMobile ? '移动端' : 'PC端');
    
    try {
      const result = await copyToClipboard(shareLink);
      
      if (result.success) {
        console.log(`复制成功，使用方法: ${result.method}`);
        setCopied(true);
        const successMessage = isMobile ? '链接已复制到剪贴板' : '分享链接已复制到剪贴板';
        toast.success('链接已复制', successMessage);
        setTimeout(() => setCopied(false), 2000);
      } else {
        console.error('复制失败:', result.error);
        
        // 移动端特殊处理
        if (isMobile) {
          try {
            const input = document.querySelector('input[title="分享链接"]') as HTMLInputElement;
            if (input) {
              input.focus();
              input.select();
              input.setSelectionRange(0, input.value.length);
              toast.error('复制失败', '请长按链接文本手动复制，或点击输入框后使用复制功能');
            } else {
              toast.error('复制失败', result.error || '请长按分享链接手动复制');
            }
          } catch (selectError) {
            console.error('选中文本失败:', selectError);
            toast.error('复制失败', '请长按分享链接手动复制');
          }
        } else {
          // PC端处理
          try {
            const input = document.querySelector('input[title="分享链接"]') as HTMLInputElement;
            if (input) {
              input.focus();
              input.select();
              input.setSelectionRange(0, input.value.length);
              toast.error('复制失败', '无法自动复制，已为您选中链接，请按 Ctrl+C 手动复制');
            } else {
              toast.error('复制失败', result.error || '无法复制链接到剪贴板，请手动复制');
            }
          } catch (selectError) {
            console.error('选中文本失败:', selectError);
            toast.error('复制失败', '请手动复制分享链接');
          }
        }
      }
    } catch (error) {
      console.error('复制操作异常:', error);
      toast.error('复制失败', '复制过程中发生异常，请稍后重试');
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'pdf',
      title: 'PDF文档',
      description: '导出为PDF文件，适合打印和存档',
      icon: <FileText className="w-5 h-5" />,
      action: handleExportToPDF,
      variant: 'export'
    },
    {
      id: 'png',
      title: 'PNG图片',
      description: '导出为高质量PNG图片',
      icon: <Image className="w-5 h-5" />,
      action: () => handleExportToImage('png'),
      variant: 'export'
    },
    {
      id: 'jpeg',
      title: 'JPEG图片',
      description: '导出为压缩JPEG图片',
      icon: <Image className="w-5 h-5" />,
      action: () => handleExportToImage('jpeg'),
      variant: 'export'
    },
    {
      id: 'link',
      title: '生成分享链接',
      description: '创建公开链接，任何人都可以查看',
      icon: <Link className="w-5 h-5" />,
      action: handleGenerateShareLink,
      variant: 'share'
    }
  ];

  const shareActions = [
    {
      id: 'qr',
      title: '二维码',
      icon: <QrCode className="w-4 h-4" />,
      disabled: !shareLink
    },
    {
      id: 'email',
      title: '邮件',
      icon: <Mail className="w-4 h-4" />,
      disabled: !shareLink
    },
    {
      id: 'message',
      title: '短信',
      icon: <MessageCircle className="w-4 h-4" />,
      disabled: !shareLink
    }
  ];

  const handleClose = () => {
    setShareLink(null);
    setCopied(false);
    setLoading(null);
    setShowDebug(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} size={isMobile ? "md" : "lg"}>
      <ModalHeader>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">分享计划</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{plan.title}</p>
            {/* PC端显示设备信息 */}
            {!isMobile && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                桌面端 · 支持拖拽和键盘快捷键
              </p>
            )}
          </div>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className={cn(
          "space-y-6 overflow-y-auto",
          isMobile ? "max-h-[60vh]" : "max-h-[70vh]"
        )}>
          {/* PC端：并排布局，移动端：垂直布局 */}
          <div className={cn(
            isMobile ? "space-y-6" : "grid grid-cols-2 gap-8"
          )}>
            {/* 导出选项 */}
            <div className={cn(isMobile ? "" : "space-y-4")}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <Download className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">导出文件</h3>
              </div>
              <div className={cn(
                "gap-3",
                isMobile ? "grid grid-cols-1" : "grid grid-cols-1 xl:grid-cols-2"
              )}>
                {shareOptions.filter(option => option.variant === 'export').map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={option.action}
                    disabled={loading === option.id || !!loading}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all duration-300',
                      'bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80',
                      'backdrop-blur-xl border-white/30 dark:border-gray-700/30',
                      'hover:from-white/90 hover:to-gray-50/90 dark:hover:from-gray-700/90 dark:hover:to-gray-800/90',
                      'hover:border-white/50 dark:hover:border-gray-600/50',
                      'hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1',
                      'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2',
                      'group transform-gpu',
                      isMobile ? "p-6" : "p-4"
                    )}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <div className={cn(
                      "flex items-start gap-3",
                      isMobile ? "gap-4" : "gap-3"
                    )}>
                      <div className="flex-shrink-0 mt-1">
                        {loading === option.id ? (
                          <div className={cn(
                            "rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center",
                            isMobile ? "w-10 h-10" : "w-8 h-8"
                          )}>
                            <Loader className={cn(
                              "animate-spin text-white",
                              isMobile ? "w-5 h-5" : "w-4 h-4"
                            )} />
                          </div>
                        ) : (
                          <div className={cn(
                            "rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300",
                            isMobile ? "w-10 h-10" : "w-8 h-8"
                          )}>
                            <div className={cn(
                              "text-white",
                              isMobile ? "text-lg" : "text-sm"
                            )}>
                              {option.icon}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-bold text-gray-900 dark:text-gray-100 mb-1",
                          isMobile ? "text-base" : "text-sm"
                        )}>
                          {option.title}
                        </h4>
                        <p className={cn(
                          "text-gray-600 dark:text-gray-400 leading-relaxed",
                          isMobile ? "text-sm" : "text-xs"
                        )}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 分享选项 */}
            <div className={cn(isMobile ? "" : "space-y-4")}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">在线分享</h3>
              </div>
              
              {/* 生成分享链接 */}
              {!shareLink && (
                <motion.button
                  onClick={handleGenerateShareLink}
                  disabled={loading === 'link'}
                  className={cn(
                    'w-full rounded-2xl border text-left transition-all duration-200',
                    'bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl',
                    'border-white/20 dark:border-gray-700/30',
                    'hover:bg-white/80 dark:hover:bg-gray-900/80 hover:border-white/40 dark:hover:border-gray-600/40',
                    'hover:shadow-lg hover:shadow-blue-500/10',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2',
                    'group',
                    isMobile ? "p-5" : "p-4"
                  )}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    {loading === 'link' ? (
                      <Loader className="w-5 h-5 animate-spin text-blue-500" />
                    ) : (
                      <Link className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        生成分享链接
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        创建公开链接，任何人都可以查看
                      </p>
                    </div>
                  </div>
                </motion.button>
              )}

              {/* 分享链接展示 */}
              <AnimatePresence>
                {shareLink && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* 链接复制区域 */}
                    <div className={cn(
                      "bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-xl border border-green-200/60 dark:border-green-800/60 rounded-2xl shadow-xl",
                      isMobile ? "p-6" : "p-4"
                    )}>
                      <div className="flex items-center gap-2 mb-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="font-medium text-green-700 dark:text-green-300">
                          分享链接已生成
                        </span>
                        {/* 移动端提示 */}
                        {isMobile && (
                          <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                            · 支持长按复制
                          </span>
                        )}
                      </div>
                      <div className={cn(
                        "flex gap-2",
                        isMobile ? "flex-col space-y-2" : "flex-row items-center"
                      )}>
                        <input
                          type="text"
                          value={shareLink}
                          readOnly
                          title="分享链接"
                          className={cn(
                            "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-green-500/20",
                            isMobile ? "flex-1 p-3 text-sm" : "flex-1 p-2 text-xs"
                          )}
                        />
                        <button
                          onClick={copyShareLink}
                          className={cn(
                            'flex items-center gap-2 rounded-xl transition-all duration-200',
                            'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm',
                            'border border-gray-200/50 dark:border-gray-600/50',
                            'hover:bg-white/80 dark:hover:bg-gray-700/80 hover:shadow-md',
                            copied && 'text-green-600 border-green-300/60 bg-green-50/60',
                            isMobile ? "justify-center px-4 py-3 text-sm w-full" : "px-3 py-2 text-xs"
                          )}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? '已复制' : (isMobile ? '复制链接' : '复制')}
                        </button>
                      </div>
                    </div>

                    {/* 调试信息面板 */}
                    <div className="border-t border-white/10 pt-4">
                      <button
                        onClick={() => setShowDebug(!showDebug)}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        <span>{isMobile ? '设备支持信息' : '剪贴板支持信息'}</span>
                        <motion.div
                          animate={{ rotate: showDebug ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          ▼
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {showDebug && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-black/20 rounded-lg"
                          >
                            {(() => {
                              const support = checkClipboardSupport();
                              return (
                                <div className="space-y-2 text-xs">
                                  <div className="grid grid-cols-2 gap-2">
                                    <span className="text-gray-400">设备类型:</span>
                                    <span className="text-blue-400">
                                      {support.deviceType === 'mobile' ? '📱 移动端' : '🖥️ 桌面端'}
                                    </span>
                                    
                                    <span className="text-gray-400">Clipboard API:</span>
                                    <span className={support.hasClipboardAPI ? 'text-green-400' : 'text-red-400'}>
                                      {support.hasClipboardAPI ? '✓ 支持' : '✗ 不支持'}
                                    </span>
                                    
                                    <span className="text-gray-400">ExecCommand:</span>
                                    <span className={support.hasExecCommand ? 'text-green-400' : 'text-red-400'}>
                                      {support.hasExecCommand ? '✓ 支持' : '✗ 不支持'}
                                    </span>
                                    
                                    <span className="text-gray-400">安全上下文:</span>
                                    <span className={support.isSecureContext ? 'text-green-400' : 'text-yellow-400'}>
                                      {support.isSecureContext ? '✓ 安全' : '⚠ 非安全'}
                                    </span>
                                    
                                    <span className="text-gray-400">推荐方法:</span>
                                    <span className="text-blue-400">{support.recommendedMethod}</span>
                                    
                                    {support.isIOS && (
                                      <>
                                        <span className="text-gray-400">iOS设备:</span>
                                        <span className="text-purple-400">✓ 检测到</span>
                                      </>
                                    )}
                                  </div>
                                  
                                  <div className="pt-2 border-t border-white/10">
                                    <p className="text-gray-400 mb-1">当前环境:</p>
                                    <div className="text-gray-500 space-y-1">
                                      <div>协议: {window.location.protocol}</div>
                                      <div>主机: {window.location.hostname}</div>
                                      <div>浏览器: {navigator.userAgent.split(' ')[0]}</div>
                                    </div>
                                  </div>
                                  
                                  {support.recommendedMethod === 'none' && (
                                    <div className="pt-2 border-t border-white/10">
                                      <p className="text-red-400 text-xs">
                                        ⚠️ 建议在 HTTPS 环境下使用复制功能
                                      </p>
                                    </div>
                                  )}
                                  
                                  {isMobile && (
                                    <div className="pt-2 border-t border-white/10">
                                      <p className="text-blue-400 text-xs">
                                        💡 移动端提示：如复制失败，请长按文本手动复制
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onPress={handleClose}>
          关闭
        </Button>
      </ModalFooter>
    </Modal>
  );
}; 