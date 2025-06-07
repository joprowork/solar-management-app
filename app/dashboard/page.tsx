'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  BoltIcon,
  CurrencyEuroIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { getCurrentUser, getProjects, getClients, getQuotes } from '@/lib/supabase'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface DashboardStats {
  totalProjects: number
  totalClients: number
  totalQuotes: number
  totalProduction: number
  totalSavings: number
  conversionRate: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalClients: 0,
    totalQuotes: 0,
    totalProduction: 0,
    totalSavings: 0,
    conversionRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        // DÉSACTIVATION TEMPORAIRE DE L'AUTHENTIFICATION POUR LE DÉVELOPPEMENT
        // const currentUser = await getCurrentUser()
        // if (!currentUser) {
        //   router.push('/')
        //   return
        // }
        
        // Utilisateur fictif pour le développement
        const mockUser = {
          id: 'dev-user-id',
          email: 'dev@example.com',
          full_name: 'Développeur Test',
          company_name: 'SolarQuote Dev',
          role: 'admin'
        }
        
        setUser(mockUser)
        
        // Charger les statistiques
        const [projectsResult, clientsResult, quotesResult] = await Promise.all([
          getProjects(mockUser.id),
          getClients(mockUser.id),
          getQuotes(mockUser.id)
        ])
        
        const projects = projectsResult.data || []
        const clients = clientsResult.data || []
        const quotes = quotesResult.data || []
        
        // Calculer les statistiques
        const totalProduction = projects.reduce((sum, project) => 
          sum + (project.simulation_results?.annual_production || 0), 0
        )
        
        const totalSavings = projects.reduce((sum, project) => 
          sum + (project.simulation_results?.annual_savings || 0), 0
        )
        
        const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length
        const conversionRate = quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0
        
        setStats({
          totalProjects: projects.length,
          totalClients: clients.length,
          totalQuotes: quotes.length,
          totalProduction,
          totalSavings,
          conversionRate
        })
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDashboard()
  }, [])

  const statCards = [
    {
      title: 'Projets totaux',
      value: stats.totalProjects,
      icon: FolderIcon,
      color: 'bg-blue-500',
      format: 'number'
    },
    {
      title: 'Clients',
      value: stats.totalClients,
      icon: UsersIcon,
      color: 'bg-green-500',
      format: 'number'
    },
    {
      title: 'Production simulée',
      value: stats.totalProduction,
      icon: SunIcon,
      color: 'bg-yellow-500',
      format: 'kwh',
      suffix: ' kWh/an'
    },
    {
      title: 'Économies prévues',
      value: stats.totalSavings,
      icon: CurrencyEuroIcon,
      color: 'bg-emerald-500',
      format: 'currency'
    },
    {
      title: 'Devis générés',
      value: stats.totalQuotes,
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      format: 'number'
    },
    {
      title: 'Taux de conversion',
      value: stats.conversionRate,
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      format: 'percentage',
      suffix: '%'
    }
  ]

  const quickActions = [
    {
      title: 'Nouveau devis',
      description: 'Créer un devis pour un nouveau projet',
      href: '/dashboard/quotes/new',
      icon: DocumentPlusIcon,
      color: 'bg-primary-600 hover:bg-primary-700'
    },
    {
      title: 'Ajouter un client',
      description: 'Enregistrer un nouveau client',
      href: '/dashboard/clients/new',
      icon: UsersIcon,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Nouveau projet',
      description: 'Démarrer un nouveau projet solaire',
      href: '/dashboard/projects/new',
      icon: SunIcon,
      color: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ]

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Bienvenue, {user?.email}. Voici un aperçu de votre activité.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            let displayValue = stat.value
            
            if (stat.format === 'currency') {
              displayValue = formatCurrency(Number(stat.value) || 0)
            } else if (stat.format === 'kwh') {
              displayValue = formatNumber(Number(stat.value) || 0, 0) + (stat.suffix || '')
            } else if (stat.format === 'percentage') {
              displayValue = formatNumber(Number(stat.value) || 0, 1) + (stat.suffix || '')
            } else {
              displayValue = formatNumber(Number(stat.value) || 0)
            }
            
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayValue}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  href={action.href}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {action.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Activité récente */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Activité récente
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              Aucune activité récente à afficher.
              <br />
              Commencez par créer votre premier projet ou client.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}