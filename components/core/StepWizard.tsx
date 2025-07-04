'use client'

import React from 'react'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  title: string
  description?: string
  optional?: boolean
}

export interface StepWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  className?: string
}

const StepWizard = React.forwardRef<HTMLDivElement, StepWizardProps>(
  ({ steps, currentStep, onStepClick, className }, ref) => {
    const isStepClickable = (stepIndex: number) => {
      // 允许点击当前步骤及之前的步骤
      return stepIndex <= currentStep && onStepClick
    }

    const getStepStatus = (stepIndex: number) => {
      if (stepIndex < currentStep) return 'completed'
      if (stepIndex === currentStep) return 'current'
      return 'upcoming'
    }

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {/* 桌面端 - 水平布局 */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isClickable = isStepClickable(index)
            
            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    'flex flex-col items-center space-y-2 transition-all duration-200',
                    isClickable && 'cursor-pointer hover:scale-105'
                  )}
                  onClick={isClickable ? () => onStepClick!(index) : undefined}
                >
                  {/* 步骤图标 */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200',
                      {
                        'bg-apple-blue border-apple-blue text-white': status === 'current',
                        'bg-apple-green border-apple-green text-white': status === 'completed',
                        'bg-white border-apple-gray-300 text-apple-gray-400': status === 'upcoming',
                      }
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckCircle size={20} className="fill-current" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* 步骤信息 */}
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-sm font-medium transition-colors duration-200',
                        {
                          'text-apple-blue': status === 'current',
                          'text-apple-green': status === 'completed',
                          'text-apple-gray-400': status === 'upcoming',
                        }
                      )}
                    >
                      {step.title}
                      {step.optional && (
                        <span className="text-xs text-apple-gray-400 ml-1">(可选)</span>
                      )}
                    </p>
                    {step.description && (
                      <p className="text-xs text-apple-gray-500 mt-1 max-w-24">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 transition-colors duration-200',
                      index < currentStep ? 'bg-apple-green' : 'bg-apple-gray-200'
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* 移动端 - 垂直布局 */}
        <div className="md:hidden space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isClickable = isStepClickable(index)
            
            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-start space-x-3 transition-all duration-200',
                  isClickable && 'cursor-pointer'
                )}
                onClick={isClickable ? () => onStepClick!(index) : undefined}
              >
                {/* 步骤图标 */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all duration-200',
                    {
                      'bg-apple-blue border-apple-blue text-white': status === 'current',
                      'bg-apple-green border-apple-green text-white': status === 'completed',
                      'bg-white border-apple-gray-300 text-apple-gray-400': status === 'upcoming',
                    }
                  )}
                >
                  {status === 'completed' ? (
                    <CheckCircle size={16} className="fill-current" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* 步骤信息 */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      {
                        'text-apple-blue': status === 'current',
                        'text-apple-green': status === 'completed',
                        'text-apple-gray-400': status === 'upcoming',
                      }
                    )}
                  >
                    {step.title}
                    {step.optional && (
                      <span className="text-xs text-apple-gray-400 ml-1">(可选)</span>
                    )}
                  </p>
                  {step.description && (
                    <p className="text-xs text-apple-gray-500 mt-1">
                      {step.description}
                    </p>
                  )}
                </div>
                
                {/* 连接线 */}
                {index < steps.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-8 bg-apple-gray-200" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)

StepWizard.displayName = 'StepWizard'

export { StepWizard } 