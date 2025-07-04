'use client'

import React from 'react'
import { 
  Modal as HeroModal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  ModalProps as HeroModalProps,
  useDisclosure
} from '@heroui/react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './Button'

export interface ModalProps extends Omit<HeroModalProps, 'size'> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  className?: string
}

export interface ModalSectionProps {
  children: React.ReactNode
  className?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    children,
    size = 'md',
    showCloseButton = true,
    className,
    ...props 
  }, ref) => {
    const sizeMap = {
      sm: 'max-w-sm',
      md: 'max-w-md', 
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full'
    }

    const baseStyles = cn(
      // Apple Design 基础样式
      'bg-white dark:bg-apple-gray-900',
      'rounded-apple-lg shadow-apple-xl',
      'border border-apple-gray-200 dark:border-apple-gray-800',
      
      // 尺寸
      sizeMap[size],
      'mx-4',
      
      className
    )

    return (
      <HeroModal
        ref={ref}
        classNames={{
          backdrop: 'bg-black bg-opacity-50 backdrop-blur-sm',
          wrapper: 'z-50',
          base: baseStyles,
          closeButton: cn(
            'text-apple-gray-400 hover:text-apple-gray-600',
            'hover:bg-apple-gray-100 dark:hover:bg-apple-gray-800',
            'rounded-full transition-colors',
            !showCloseButton && 'hidden'
          )
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1] // Apple's signature easing
              }
            },
            exit: {
              y: -20,
              opacity: 0,
              scale: 0.95,
              transition: {
                duration: 0.2,
                ease: 'easeOut'
              }
            }
          }
        }}
        {...props}
      >
        <ModalContent>
          {children}
        </ModalContent>
      </HeroModal>
    )
  }
)

const ModalHeaderComponent = React.forwardRef<HTMLDivElement, ModalSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ModalHeader
        className={cn(
          'text-apple-gray-900 dark:text-apple-gray-100',
          'text-xl font-semibold',
          'pb-3 border-b border-apple-gray-100 dark:border-apple-gray-800',
          className
        )}
        {...props}
      >
        {children}
      </ModalHeader>
    )
  }
)

const ModalBodyComponent = React.forwardRef<HTMLDivElement, ModalSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ModalBody
        className={cn(
          'text-apple-gray-700 dark:text-apple-gray-300',
          'py-4',
          className
        )}
        {...props}
      >
        {children}
      </ModalBody>
    )
  }
)

const ModalFooterComponent = React.forwardRef<HTMLDivElement, ModalSectionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ModalFooter
        className={cn(
          'pt-3 border-t border-apple-gray-100 dark:border-apple-gray-800',
          'flex justify-end gap-2',
          className
        )}
        {...props}
      >
        {children}
      </ModalFooter>
    )
  }
)

// 确认对话框组件
export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'danger' | 'primary'
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmVariant = 'primary'
}) => {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
      <ModalHeaderComponent>{title}</ModalHeaderComponent>
      <ModalBodyComponent>
        <p className="text-apple-gray-600 dark:text-apple-gray-400">
          {message}
        </p>
      </ModalBodyComponent>
      <ModalFooterComponent>
        <Button variant="secondary" onPress={onClose}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onPress={handleConfirm}>
          {confirmText}
        </Button>
      </ModalFooterComponent>
    </Modal>
  )
}

// Hook for modal state management
export { useDisclosure }

Modal.displayName = 'Modal'
ModalHeaderComponent.displayName = 'ModalHeader'
ModalBodyComponent.displayName = 'ModalBody'
ModalFooterComponent.displayName = 'ModalFooter'

export { 
  Modal, 
  ModalHeaderComponent as ModalHeader, 
  ModalBodyComponent as ModalBody, 
  ModalFooterComponent as ModalFooter 
} 