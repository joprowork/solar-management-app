'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BoltIcon,
  CalendarIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Project {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  estimated_production?: number
  estimated_savings?: number
  panel_count?: number
  client: {
    id: string
    first_name: string
    last_name: string
    city: string
  }
}

const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'pending', label: 'En attente' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm, statusFilter])

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
          *,
          client:clients(
            id,
            first_name,
            last_name,
            city
          )
        `)
        .eq('user_id', mockUser.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError('Erreur lors du chargement des projets')
        console.error(error)
      } else {
        setProjects(data || [])
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(term) ||
        `${project.client.first_name} ${project.client.last_name}`.toLowerCase().includes(term) ||
        project.client.city.toLowerCase().includes(term)
      )
    }

    // Filtrer par statut
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    setFilteredProjects(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
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
      case 'draft':
        return 'Brouillon'
      case 'cancelled':
        return 'Annulé'
      default:
        return status
    }
  }

  // Statistiques
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    pending: projects.filter(p => p.status === 'pending').length,
    total_production: projects.reduce((sum, p) => sum + (p.estimated_production || 0), 0),
    total_savings: projects.reduce((sum, p) => sum + (p.estimated_savings || 0), 0)
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes projets
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Gérez tous vos projets photovoltaïques
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau projet
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {stats.total}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total projets
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    {stats.completed}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Terminés
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">
                    {stats.in_progress}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  En cours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-8 w-8 text-solar-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Production totale
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.total_production.toLocaleString()} kWh/an
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-solar-100 dark:bg-solar-900 rounded-lg flex items-center justify-center">
                  <span className="text-solar-600 dark:text-solar-400 text-xs font-bold">€</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Économies totales
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(stats.total_savings)}/an
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom de projet, client ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des projets */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              {error}
            </div>
          )}
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BoltIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {projects.length === 0 ? 'Aucun projet' : 'Aucun projet trouvé'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {projects.length === 0 
                  ? 'Commencez par créer votre premier projet photovoltaïque'
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
              {projects.length === 0 && (
                <Link href="/dashboard/projects/new" className="btn-primary inline-flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Créer un projet
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Production
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Économies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {project.name}
                          </div>
                          {project.panel_count && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {project.panel_count} panneaux
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {project.client.first_name} {project.client.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {project.client.city}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {project.estimated_production ? (
                          <div className="flex items-center">
                            <BoltIcon className="h-4 w-4 text-solar-500 mr-1" />
                            {project.estimated_production.toLocaleString()} kWh/an
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {project.estimated_savings ? (
                          formatCurrency(project.estimated_savings) + '/an'
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(new Date(project.created_at))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/dashboard/projects/${project.id}/edit`}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}