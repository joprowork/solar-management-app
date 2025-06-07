'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { createClientRecord, getCurrentUser } from '@/lib/supabase'
import { validateEmail, validatePhone, validatePDL } from '@/lib/utils'

interface ClientFormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  pdl?: string
}

export default function NewClientPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ClientFormData>()

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    setError(null)
    console.log('Form data submitted:', data) // Log des données du formulaire
    
    try {
      // TEMPORAIRE: Désactivation de l'authentification pour le développement
      // const currentUser = await getCurrentUser()
      // if (!currentUser) {
      //   setError('Utilisateur non connecté')
      //   return
      // }
      
      // TEMPORAIRE: Utilisation d'un utilisateur fictif pour le développement
      const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' }

      const clientData = {
        ...data,
        user_id: mockUser.id
      }
      console.log('Data sent to createClientRecord:', clientData) // Log des données envoyées à Supabase

      const { data: newClient, error: createError } = await createClientRecord(clientData) // Capture de la donnée en cas de succès
      
      if (createError) {
        setError(`Erreur lors de la création du prospect: ${createError.message}`)
        console.error('Supabase create error:', createError) // Log de l'erreur Supabase
      } else {
        console.log('Prospect created successfully:', newClient) // Log du prospect créé
        router.push('/dashboard/clients')
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error('Unexpected error:', err) // Log de l'erreur inattendue
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nouveau prospect
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Ajoutez un nouveau prospect à votre base de données
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    {...register('first_name', {
                      required: 'Le prénom est requis'
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Jean"
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    {...register('last_name', {
                      required: 'Le nom est requis'
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Dupont"
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email', {
                      required: 'L\'email est requis',
                      validate: (value) => validateEmail(value) || 'Format d\'email invalide'
                    })}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="jean.dupont@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    {...register('phone', {
                      required: 'Le téléphone est requis',
                      validate: (value) => validatePhone(value) || 'Format de téléphone invalide'
                    })}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="06 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Adresse
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse *
                  </label>
                  <input
                    {...register('address', {
                      required: 'L\'adresse est requise'
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="123 rue de la République"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ville *
                    </label>
                    <input
                      {...register('city', {
                        required: 'La ville est requise'
                      })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Paris"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code postal *
                    </label>
                    <input
                      {...register('postal_code', {
                        required: 'Le code postal est requis',
                        pattern: {
                          value: /^\d{5}$/,
                          message: 'Le code postal doit contenir 5 chiffres'
                        }
                      })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="75001"
                    />
                    {errors.postal_code && (
                      <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations énergétiques */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations énergétiques
              </h3>
              <div>
                <label htmlFor="pdl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Point de Livraison (PDL)
                  <span className="text-gray-500 text-xs ml-2">(optionnel - 14 chiffres)</span>
                </label>
                <input
                  {...register('pdl', {
                    validate: (value) => {
                      if (!value) return true // Optionnel
                      return validatePDL(value) || 'Le PDL doit contenir exactement 14 chiffres'
                    }
                  })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="12345678901234"
                  maxLength={14}
                />
                {errors.pdl && (
                  <p className="mt-1 text-sm text-red-600">{errors.pdl.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Le PDL permet de récupérer automatiquement les données de consommation électrique
                </p>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer le prospect'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}