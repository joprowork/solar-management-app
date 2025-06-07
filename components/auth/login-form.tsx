'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      
      if (error) {
        setError('Email ou mot de passe incorrect')
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Format d\'email invalide'
            }
          })}
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <input
            {...register('password', {
              required: 'Le mot de passe est requis',
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
              }
            })}
            type={showPassword ? 'text' : 'password'}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <button
            type="button"
            className="text-primary-600 hover:text-primary-500 font-medium"
            onClick={() => {
              // TODO: Implémenter l'inscription
              alert('Fonctionnalité d\'inscription à venir')
            }}
          >
            Créer un compte
          </button>
        </p>
      </div>

      {/* Compte de démonstration */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
          Compte de démonstration :
        </p>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm">
          <p><strong>Email:</strong> demo@solarquote.pro</p>
          <p><strong>Mot de passe:</strong> demo123</p>
        </div>
      </div>
    </form>
  )
}