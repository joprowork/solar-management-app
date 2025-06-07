'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  BoltIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  pdl?: string
  created_at: string
  updated_at: string
}

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  estimated_production?: number
  estimated_savings?: number
}

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          setError('Utilisateur non connecté')
          return
        }

        // Charger les données du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .eq('user_id', currentUser.id)
          .single()

        if (clientError) {
          setError('Client non trouvé')
          console.error(clientError)
          return
        }

        setClient(clientData)

        // Charger les projets du client
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('client_id', clientId)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (projectsError) {
          console.error('Erreur lors du chargement des projets:', projectsError)
        } else {
          setProjects(projectsData || [])
        }
      } catch (err) {
        setError('Erreur lors du chargement des données')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (clientId) {
      loadClientData()
    }
  }, [clientId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError('Utilisateur non connecté')
        return
      }

      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', currentUser.id)

      if (error) {
        setError('Erreur lors de la suppression')
        console.error(error)
      } else {
        router.push('/dashboard/clients')
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé'
      case 'in_progress':
        return 'En cours'
      case 'pending':
        return 'En attente'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Prospect non trouvé'}
          </h2>
          <button
            onClick={() => router.push('/dashboard/clients')}
            className="btn-primary"
          >
            Retour aux prospects
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
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
                {client.first_name} {client.last_name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Client depuis le {formatDate(client.created_at)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="btn-outline inline-flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20 inline-flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du client */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations de contact
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Téléphone</p>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      {client.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse</p>
                    <p className="text-gray-900 dark:text-white">
                      {client.address}<br />
                      {client.postal_code} {client.city}
                    </p>
                  </div>
                </div>
                
                {client.pdl && (
                  <div className="flex items-center">
                    <BoltIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">PDL</p>
                      <p className="text-gray-900 dark:text-white font-mono">
                        {client.pdl}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projets */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Projets ({projects.length})
                </h2>
                <Link
                  href={`/dashboard/projects/new?client_id=${client.id}`}
                  className="btn-primary inline-flex items-center text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouveau projet
                </Link>
              </div>
              
              <div className="p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Aucun projet pour ce client
                    </p>
                    <Link
                      href={`/dashboard/projects/new?client_id=${client.id}`}
                      className="btn-primary inline-flex items-center"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Créer le premier projet
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                          >
                            {project.name}
                          </Link>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                            {getStatusLabel(project.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(project.created_at)}
                          </div>
                          
                          {project.estimated_production && (
                            <div className="flex items-center">
                              <BoltIcon className="h-4 w-4 mr-1" />
                              {project.estimated_production.toLocaleString()} kWh/an
                            </div>
                          )}
                          
                          {project.estimated_savings && (
                            <div>
                              Économies: {formatCurrency(project.estimated_savings)}/an
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Supprimer le client
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer {client.first_name} {client.last_name} ?
              Cette action est irréversible et supprimera également tous les projets associés.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-outline"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}