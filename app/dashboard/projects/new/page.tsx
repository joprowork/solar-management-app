'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface ProjectFormData {
  name: string
  description?: string
  client_id: string
  status: string
}

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  city: string
  address: string
}

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' }
]

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedClientId = searchParams.get('client_id')
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingClients, setIsLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProjectFormData>({
    defaultValues: {
      status: 'draft',
      client_id: preselectedClientId || ''
    }
  })

  const watchedClientId = watch('client_id')

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    // Filtrer les clients selon la recherche
    const filtered = clients.filter(client => {
      const fullName = `${client.first_name} ${client.last_name}`.toLowerCase()
      const searchTerm = clientSearch.toLowerCase()
      return fullName.includes(searchTerm) || 
             client.email.toLowerCase().includes(searchTerm) ||
             client.city.toLowerCase().includes(searchTerm)
    })
    setFilteredClients(filtered)
  }, [clients, clientSearch])

  useEffect(() => {
    // Sélectionner automatiquement le client si pré-sélectionné
    if (preselectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === preselectedClientId)
      if (client) {
        setSelectedClient(client)
        setValue('client_id', client.id)
      }
    }
  }, [preselectedClientId, clients, setValue])

  const loadClients = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError('Utilisateur non connecté')
        return
      }

      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, city, address')
        .eq('user_id', currentUser.id)
        .order('first_name')

      if (error) {
        setError('Erreur lors du chargement des clients')
        console.error(error)
      } else {
        setClients(data || [])
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoadingClients(false)
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

      if (!data.client_id) {
        setError('Veuillez sélectionner un client')
        return
      }

      const projectData = {
        ...data,
        user_id: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()
      
      if (createError) {
        setError('Erreur lors de la création du projet')
        console.error(createError)
      } else {
        router.push(`/dashboard/projects/${newProject.id}`)
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setValue('client_id', client.id)
    setClientSearch('')
    setShowClientDropdown(false)
  }

  const handleClientSearchFocus = () => {
    setShowClientDropdown(true)
    if (selectedClient) {
      setClientSearch(`${selectedClient.first_name} ${selectedClient.last_name}`)
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
              Nouveau projet
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Créez un nouveau projet photovoltaïque
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

            {/* Sélection du client */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Client
              </h3>
              
              <div className="relative">
                <label htmlFor="client_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher un client *
                </label>
                
                {isLoadingClients ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                      Chargement des clients...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        onFocus={handleClientSearchFocus}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Rechercher par nom, email ou ville..."
                      />
                    </div>
                    
                    {/* Dropdown des clients */}
                    {showClientDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredClients.length === 0 ? (
                          <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                            {clients.length === 0 ? (
                              <div>
                                Aucun client trouvé.
                                <button
                                  type="button"
                                  onClick={() => router.push('/dashboard/clients/new')}
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 ml-1"
                                >
                                  Créer un client
                                </button>
                              </div>
                            ) : (
                              'Aucun client correspondant à votre recherche'
                            )}
                          </div>
                        ) : (
                          filteredClients.map((client) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => handleClientSelect(client)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {client.first_name} {client.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {client.email} • {client.city}
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
                
                {/* Client sélectionné */}
                {selectedClient && (
                  <div className="mt-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-primary-900 dark:text-primary-100">
                          {selectedClient.first_name} {selectedClient.last_name}
                        </div>
                        <div className="text-sm text-primary-700 dark:text-primary-300">
                          {selectedClient.email} • {selectedClient.address}, {selectedClient.city}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClient(null)
                          setValue('client_id', '')
                          setClientSearch('')
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
                  {...register('client_id', {
                    required: 'Veuillez sélectionner un client'
                  })}
                />
                {errors.client_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
                )}
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
                disabled={isLoading || !selectedClient}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création...' : 'Créer le projet'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Overlay pour fermer le dropdown */}
      {showClientDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowClientDropdown(false)}
        />
      )}
    </DashboardLayout>
  )
}