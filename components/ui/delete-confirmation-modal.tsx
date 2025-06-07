'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  isLoading = false
}: DeleteConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 150) // Délai pour l'animation
  }

  const handleConfirm = () => {
    onConfirm()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          {/* Icône et titre */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
            {/* Bouton fermer */}
            <button
              type="button"
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={handleClose}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Boutons d'action */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Suppression...
                </>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto transition-colors duration-200"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}