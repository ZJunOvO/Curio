import { supabase } from '@/lib/supabase/client';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number; // MB
  allowedTypes?: string[];
}

/**
 * 文件上传服务
 */
export class UploadService {
  private defaultBucket = 'uploads';
  private defaultFolder = 'images';
  private defaultMaxSize = 10; // 10MB
  private defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * 上传文件到Supabase Storage
   */
  async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      bucket = this.defaultBucket,
      folder = this.defaultFolder,
      maxSize = this.defaultMaxSize,
      allowedTypes = this.defaultAllowedTypes
    } = options;

    // 验证文件
    this.validateFile(file, maxSize, allowedTypes);

    // 生成唯一文件名
    const fileName = this.generateFileName(file);
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    try {
      // 上传文件
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`上传失败: ${error.message}`);
      }

      // 获取公共URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        size: file.size
      };
    } catch (error) {
      console.error('文件上传错误:', error);
      throw error;
    }
  }

  /**
   * 上传图片（专门用于图片上传）
   */
  async uploadImage(file: File, folder = 'covers'): Promise<string> {
    const result = await this.uploadFile(file, {
      folder,
      maxSize: 5, // 图片限制5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });
    return result.url;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string, bucket = this.defaultBucket): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw new Error(`删除失败: ${error.message}`);
      }
    } catch (error) {
      console.error('文件删除错误:', error);
      throw error;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string, bucket = this.defaultBucket) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(filePath);

      if (error) {
        throw new Error(`获取文件信息失败: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('获取文件信息错误:', error);
      throw error;
    }
  }

  /**
   * 验证文件
   */
  private validateFile(file: File, maxSize: number, allowedTypes: string[]): void {
    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`不支持的文件类型: ${file.type}。支持的类型: ${allowedTypes.join(', ')}`);
    }

    // 检查文件大小
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大允许: ${maxSize}MB`);
    }

    // 检查文件名
    if (!file.name || file.name.trim() === '') {
      throw new Error('文件名不能为空');
    }
  }

  /**
   * 生成唯一文件名
   */
  private generateFileName(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(file.name);
    return `${timestamp}_${randomString}${extension}`;
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
  }

  /**
   * 压缩图片 (客户端压缩)
   */
  async compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // 设置canvas尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// 创建全局实例
export const uploadService = new UploadService();

// 便捷函数
export const uploadImage = (file: File, folder?: string) => 
  uploadService.uploadImage(file, folder);

export const uploadFile = (file: File, options?: UploadOptions) => 
  uploadService.uploadFile(file, options);

export const deleteFile = (filePath: string, bucket?: string) => 
  uploadService.deleteFile(filePath, bucket);

export const compressImage = (file: File, maxWidth?: number, quality?: number) => 
  uploadService.compressImage(file, maxWidth, quality);