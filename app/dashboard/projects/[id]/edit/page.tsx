'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface ProjectFormData {
  name: string
  description?: string
  status: string
  estimated_production?: number
  estimated_savings?: number
}

interface Project {
  id: string
  name: string
  description?: string
  status: string
  estimated_production?: number
  estimated_savings?: number
  client: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
]

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProjectFormData>()

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError('Utilisateur non connecté')
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', projectId)
        .eq('user_id', currentUser.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Projet non trouvé')
        } else {
          setError('Erreur lors du chargement du projet')
        }
        console.error(error)
      } else {
        setProject(data)
        // Pré-remplir le formulaire
        reset({
          name: data.name,
          description: data.description || '',
          status: data.status,
          estimated_production: data.estimated_production || undefined,
          estimated_savings: data.estimated_savings || undefined
        })
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoadingProject(false)
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError('Utilisateur non connecté')
        return
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
        // Convertir les chaînes vides en null pour les champs numériques
        estimated_production: data.estimated_production || null,
        estimated_savings: data.estimated_savings || null
      }

      const { error: updateError } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .eq('user_id', currentUser.id)
      
      if (updateError) {
        setError('Erreur lors de la mise à jour du projet')
        console.error(updateError)
      } else {
        router.push(`/dashboard/projects/${projectId}`)
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProject) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !project) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {error || 'Projet non trouvé'}
          </div>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            Retour
          </button>
        </div>
      </DashboardLayout>
    )
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
              Modifier le projet
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {project.name} • Client: {project.client.first_name} {project.client.last_name}
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

            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations générales
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du projet *
                  </label>
                  <input
                    {...register('name', {
                      required: 'Le nom du projet est requis'
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Installation photovoltaïque - Maison individuelle"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                    <span className="text-gray-500 text-xs ml-2">(optionnel)</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Description détaillée du projet..."
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut *
                  </label>
                  <select
                    {...register('status', {
                      required: 'Le statut est requis'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Estimations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Estimations
                <span className="text-gray-500 text-sm font-normal ml-2">(optionnel)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="estimated_production" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Production annuelle estimée
                    <span className="text-gray-500 text-xs ml-1">(kWh)</span>
                  </label>
                  <input
                    {...register('estimated_production', {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: 'La production doit être positive'
                      }
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="5000"
                  />
                  {errors.estimated_production && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_production.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="estimated_savings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Économies annuelles estimées
                    <span className="text-gray-500 text-xs ml-1">(€)</span>
                  </label>
                  <input
                    {...register('estimated_savings', {
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: 'Les économies doivent être positives'
                      }
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="800"
                  />
                  {errors.estimated_savings && (
                    <p className="mt-1 text-sm text-red-600">{errors.estimated_savings.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                <p>💡 Ces estimations peuvent être calculées automatiquement lors de la création d'un devis avec simulation.</p>
              </div>
            </div>

            {/* Informations client (lecture seule) */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Client associé
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {project.client.first_name} {project.client.last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {project.client.email}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Le client ne peut pas être modifié après la création du projet
                  </div>
                </div>
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
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}