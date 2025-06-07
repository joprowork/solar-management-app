'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  BoltIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  created_at: string
  updated_at: string
  estimated_production?: number
  estimated_savings?: number
  client: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    address: string
    city: string
    postal_code: string
    pdl?: string
  }
}

interface Quote {
  id: string
  name: string
  total_amount: number
  status: string
  created_at: string
}

const statusConfig = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  completed: { label: 'Terminé', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (projectId) {
      loadProject()
      loadQuotes()
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
            email,
            phone,
            address,
            city,
            postal_code,
            pdl
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
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadQuotes = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) return

      const { data, error } = await supabase
        .from('quotes')
        .select('id, name, total_amount, status, created_at')
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des devis:', error)
      } else {
        setQuotes(data || [])
      }
    } catch (err) {
      console.error('Erreur lors du chargement des devis:', err)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setError('Utilisateur non connecté')
        return
      }

      // Supprimer d'abord les devis associés
      const { error: quotesError } = await supabase
        .from('quotes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id)

      if (quotesError) {
        setError('Erreur lors de la suppression des devis')
        console.error(quotesError)
        return
      }

      // Puis supprimer le projet
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', currentUser.id)

      if (projectError) {
        setError('Erreur lors de la suppression du projet')
        console.error(projectError)
      } else {
        router.push('/dashboard/projects')
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (isLoading) {
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
          <Link href="/dashboard/projects" className="btn-primary">
            Retour aux projets
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const statusInfo = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft

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
                {project.name}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Créé le {formatDate(project.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/dashboard/projects/${project.id}/edit`}
              className="btn-outline"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-outline text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {project.description && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {/* Informations client */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Informations client
                </h3>
                <Link
                  href={`/dashboard/clients/${project.client.id}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm"
                >
                  Voir le profil
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</div>
                  <div className="text-gray-900 dark:text-white">
                    {project.client.first_name} {project.client.last_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</div>
                  <div className="text-gray-900 dark:text-white">{project.client.email}</div>
                </div>
                {project.client.phone && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</div>
                    <div className="text-gray-900 dark:text-white">{project.client.phone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</div>
                  <div className="text-gray-900 dark:text-white">
                    {project.client.address}, {project.client.postal_code} {project.client.city}
                  </div>
                </div>
                {project.client.pdl && (
                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">PDL</div>
                    <div className="text-gray-900 dark:text-white font-mono">{project.client.pdl}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Devis associés */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Devis ({quotes.length})
                </h3>
                <Link
                  href={`/dashboard/quotes/new?project_id=${project.id}`}
                  className="btn-primary text-sm"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Nouveau devis
                </Link>
              </div>
              
              {quotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun devis créé pour ce projet</p>
                  <Link
                    href={`/dashboard/quotes/new?project_id=${project.id}`}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm mt-2 inline-block"
                  >
                    Créer le premier devis
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {quote.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Créé le {formatDate(quote.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(quote.total_amount)}
                        </div>
                        <div className="text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' :
                            quote.status === 'sent' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            quote.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {quote.status === 'draft' ? 'Brouillon' :
                             quote.status === 'sent' ? 'Envoyé' :
                             quote.status === 'accepted' ? 'Accepté' : 'Refusé'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Estimations
              </h3>
              
              <div className="space-y-4">
                {project.estimated_production ? (
                  <div className="flex items-center">
                    <BoltIcon className="h-5 w-5 text-yellow-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Production annuelle</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.estimated_production.toLocaleString()} kWh
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 dark:text-gray-500">
                    <BoltIcon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="text-sm">Production annuelle</div>
                      <div className="text-sm">Non calculée</div>
                    </div>
                  </div>
                )}
                
                {project.estimated_savings ? (
                  <div className="flex items-center">
                    <CurrencyEuroIcon className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Économies annuelles</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(project.estimated_savings)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400 dark:text-gray-500">
                    <CurrencyEuroIcon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="text-sm">Économies annuelles</div>
                      <div className="text-sm">Non calculées</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Actions rapides
              </h3>
              
              <div className="space-y-3">
                <Link
                  href={`/dashboard/quotes/new?project_id=${project.id}`}
                  className="w-full btn-primary text-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Créer un devis
                </Link>
                
                <Link
                  href={`/dashboard/projects/${project.id}/edit`}
                  className="w-full btn-outline text-center"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Modifier le projet
                </Link>
                
                <Link
                  href={`/dashboard/clients/${project.client.id}`}
                  className="w-full btn-outline text-center"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Voir le client
                </Link>
              </div>
            </div>

            {/* Informations système */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Créé le</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(project.created_at)}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">Modifié le</div>
                    <div className="text-gray-900 dark:text-white">{formatDate(project.updated_at)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action supprimera également tous les devis associés et ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-primary bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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