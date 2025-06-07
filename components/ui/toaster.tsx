'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToasterContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToast must be used within a ToasterProvider')
  }
  return context
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, toast.duration || 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToasterContext.Provider>
  )
}

function ToastIcon({ type }: { type: ToastType }) {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon
  }
  
  const Icon = icons[type]
  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500'
  }
  
  return <Icon className={cn('h-5 w-5', colors[type])} />
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
  }

  return (
    <div className={cn(
      'flex items-start p-4 rounded-lg border shadow-lg animate-slide-up',
      bgColors[toast.type]
    )}>
      <ToastIcon type={toast.type} />
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        ✕
      </button>
    </div>
  )
}

// Contexte global pour les toasts
const globalToasts: Toast[] = []
let globalAddToast: (toast: Omit<Toast, 'id'>) => void = () => {}
let globalRemoveToast: (id: string) => void = () => {}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Initialiser les fonctions globales
  useEffect(() => {
    const addToast = (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast = { ...toast, id }
      setToasts(prev => [...prev, newToast])
      
      // Auto remove after duration
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }

    const removeToast = (id: string) => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }

    // Mettre à jour les fonctions globales
    globalAddToast = addToast
    globalRemoveToast = removeToast
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={globalRemoveToast}
        />
      ))}
    </div>
  )
}

// Hook pour utiliser facilement les toasts
export function useToastNotification() {
  return {
    success: (title: string, description?: string) => 
      globalAddToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      globalAddToast({ type: 'error', title, description }),
    info: (title: string, description?: string) => 
      globalAddToast({ type: 'info', title, description }),
    warning: (title: string, description?: string) => 
      globalAddToast({ type: 'warning', title, description })
  }
}