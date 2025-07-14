'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  maxSize?: number; // MB
  accept?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
  placeholder = '点击或拖拽上传图片',
  maxSize = 5, // 5MB
  accept = 'image/*',
  aspectRatio = 'auto'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-video'; // 默认16:9
    }
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '请选择图片文件';
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小不能超过 ${maxSize}MB`;
    }
    
    return null;
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (onUpload) {
      setIsUploading(true);
      try {
        const uploadedUrl = await onUpload(file);
        onChange(uploadedUrl);
        setPreviewUrl(uploadedUrl);
      } catch (error) {
        console.error('上传失败:', error);
        setError('上传失败，请重试');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(url); // 清理临时URL
      }
    } else {
      // 如果没有提供上传函数，直接使用文件URL
      onChange(url);
    }
  }, [onChange, onUpload, maxSize]);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    setPreviewUrl(null);
    onChange(null);
    setError(null);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer group',
          getAspectRatioClass(),
          isDragging
            ? 'border-blue-400 bg-blue-50/10'
            : 'border-white/20 hover:border-white/40',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-red-400'
        )}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img
                src={previewUrl}
                alt="预览"
                className="w-full h-full object-cover"
                onError={() => {
                  setError('图片加载失败');
                  setPreviewUrl(null);
                }}
              />
              
              {/* 删除按钮 */}
              {!disabled && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemove}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              {/* 上传中遮罩 */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">上传中...</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full p-6 text-center"
            >
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors',
                  isDragging ? 'bg-blue-500' : 'bg-white/10'
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <Upload className="w-6 h-6 text-white" />
                )}
              </motion.div>
              
              <p className="text-sm text-white/80 mb-1">
                {isUploading ? '上传中...' : placeholder}
              </p>
              
              <p className="text-xs text-white/50">
                支持 JPG, PNG, WebP 格式，最大 {maxSize}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 错误信息 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageUpload;