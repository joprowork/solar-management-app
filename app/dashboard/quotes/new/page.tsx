'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface QuoteFormData {
  name: string
  description?: string
  project_id: string
  total_amount: number
  status: string
}

interface Project {
  id: string
  name: string
  client: {
    id: string
    first_name: string
    last_name: string
    email: string
    city: string
  }
}

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoyé' }
]

export default function NewQuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedProjectId = searchParams.get('project_id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [projectSearch, setProjectSearch] = useState('')
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<QuoteFormData>({
    defaultValues: {
      status: 'draft',
      project_id: preselectedProjectId || '',
      total_amount: 0
    }
  })

  const watchedProjectId = watch('project_id')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    // Filtrer les projets selon la recherche
    const filtered = projects.filter(project => {
      const projectName = project.name.toLowerCase()
      const clientName = `${project.client.first_name} ${project.client.last_name}`.toLowerCase()
      const searchTerm = projectSearch.toLowerCase()
      return projectName.includes(searchTerm) || 
             clientName.includes(searchTerm) ||
             project.client.email.toLowerCase().includes(searchTerm) ||
             project.client.city.toLowerCase().includes(searchTerm)
    })
    setFilteredProjects(filtered)
  }, [projects, projectSearch])

  useEffect(() => {
    // Sélectionner automatiquement le projet si pré-sélectionné
    if (preselectedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === preselectedProjectId)
      if (project) {
        setSelectedProject(project)
        setValue('project_id', project.id)
      }
    }
  }, [preselectedProjectId, projects, setValue])

  const loadProjects = async () => {
    try {
      // DÉSACTIVATION TEMPORAIRE DE L'AUTHENTIFICATION POUR LE DÉVELOPPEMENT
      // const currentUser = await getCurrentUser()
      // if (!currentUser) {
      //   setError('Utilisateur non connecté')
      //   return
      // }
      
      // Utilisateur fictif pour le développement
      const mockUser = {
        id: 'dev-user-id',
        email: 'dev@example.com'
      }

      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          client:clients(
            id,
            first_name,
            last_name,
            email,
            city
          )
        `)
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Erreur lors du chargement des projets')
        console.error(error)
      } else {
        // Transformer les données pour correspondre à l'interface Project
        const formattedProjects = (data || []).map(item => ({
          ...item,
          client: Array.isArray(item.client) && item.client.length > 0 
            ? item.client[0] 
            : { id: '', first_name: '', last_name: '', email: '', city: '' }
        })) as Project[]
        
        setProjects(formattedProjects)
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // DÉSACTIVATION TEMPORAIRE DE L'AUTHENTIFICATION POUR LE DÉVELOPPEMENT
      // const currentUser = await getCurrentUser()
      // if (!currentUser) {
      //   setError('Utilisateur non connecté')
      //   return
      // }
      
      // Utilisateur fictif pour le développement
      const mockUser = {
        id: 'dev-user-id',
        email: 'dev@example.com'
      }

      if (!data.project_id) {
        setError('Veuillez sélectionner un projet')
        return
      }

      // Récupérer l'ID du client associé au projet
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('client_id')
        .eq('id', data.project_id)
        .single()

      if (projectError) {
        setError('Erreur lors de la récupération des informations du projet')
        console.error(projectError)
        return
      }

      const quoteData = {
        ...data,
        client_id: projectData.client_id,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newQuote, error: createError } = await supabase
        .from('quotes')
        .insert([quoteData])
        .select()
        .single()
      
      if (createError) {
        setError('Erreur lors de la création du devis')
        console.error(createError)
      } else {
        router.push(`/dashboard/quotes/${newQuote.id}`)
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project)
    setValue('project_id', project.id)
    setProjectSearch('')
    setShowProjectDropdown(false)
  }

  const handleProjectSearchFocus = () => {
    setShowProjectDropdown(true)
    if (selectedProject) {
      setProjectSearch(selectedProject.name)
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
              Nouveau devis
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Créez un nouveau devis pour un projet
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

            {/* Sélection du projet */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Projet associé
              </h3>
              
              <div className="relative">
                <label htmlFor="project_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher un projet *
                </label>
                
                {isLoadingProjects ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                      Chargement des projets...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onFocus={handleProjectSearchFocus}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Rechercher par nom de projet ou client..."
                      />
                    </div>
                    
                    {/* Dropdown des projets */}
                    {showProjectDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProjects.length === 0 ? (
                          <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {projects.length === 0 ? (
                              <div>
                                Aucun projet trouvé.
                                <button
                                  type="button"
                                  onClick={() => router.push('/dashboard/projects/new')}
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-1"
                                >
                                  Créer un projet
                                </button>
                              </div>
                            ) : (
                              'Aucun projet correspondant à votre recherche'
                            )}
                          </div>
                        ) : (
                          filteredProjects.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => handleProjectSelect(project)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {project.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Client: {project.client.first_name} {project.client.last_name} • {project.client.city}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Projet sélectionné */}
                {selectedProject && (
                  <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-primary-900 dark:text-primary-100">
                          {selectedProject.name}
                        </div>
                        <div className="text-sm text-primary-700 dark:text-primary-300">
                          Client: {selectedProject.client.first_name} {selectedProject.client.last_name} • {selectedProject.client.email}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(null)
                          setValue('project_id', '')
                          setProjectSearch('')
                        }}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  type="hidden"
                  {...register('project_id', {
                    required: 'Veuillez sélectionner un projet'
                  })}
                />
                {errors.project_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_id.message}</p>
                )}
              </div>
            </div>

            {/* Informations générales */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations du devis
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du devis *
                  </label>
                  <input
                    {...register('name', {
                      required: 'Le nom du devis est requis'
                    })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Devis installation photovoltaïque - 6 panneaux"
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
                    placeholder="Description détaillée du devis..."
                  />
                </div>

                <div>
                  <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Montant total (€) *
                  </label>
                  <input
                    {...register('total_amount', {
                      required: 'Le montant total est requis',
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: 'Le montant doit être positif'
                      }
                    })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="10000"
                  />
                  {errors.total_amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.total_amount.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut initial *
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
                disabled={isLoading || !selectedProject}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer le devis'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Overlay pour fermer le dropdown */}
      {showProjectDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowProjectDropdown(false)}
        />
      )}
    </DashboardLayout>
  )
}