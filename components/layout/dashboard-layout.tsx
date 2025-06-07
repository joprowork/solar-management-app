'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  PresentationChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { signOut } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Attendre le montage pour éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: HomeIcon },
    { name: 'Prospects', href: '/dashboard/clients', icon: UsersIcon },
    { name: 'Mes projets', href: '/dashboard/projects', icon: FolderIcon },
    { name: 'Nouveau devis', href: '/dashboard/quotes/new', icon: DocumentPlusIcon },
    { name: 'Historique devis', href: '/dashboard/quotes', icon: DocumentTextIcon },
    { name: 'Offres commerciales', href: '/dashboard/offers', icon: PresentationChartBarIcon },
    { name: 'Paramètres', href: '/dashboard/settings', icon: CogIcon },
    { name: 'Support / Aide', href: '/dashboard/support', icon: QuestionMarkCircleIcon },
  ]

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar pour mobile */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-40 flex">
          <div
            className={cn(
              'fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity',
              isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setIsSidebarOpen(false)}
          />
          
          <div
            className={cn(
              'relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transition-transform',
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="sr-only">Fermer le menu</span>
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <Logo className="h-8 w-auto" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  SolarQuote Pro
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                        'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                      )}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                          'mr-4 flex-shrink-0 h-6 w-6'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={handleSignOut}
                className="flex-shrink-0 group block w-full text-left"
              >
                <div className="flex items-center">
                  <div>
                    <div className="text-base font-medium text-gray-700 dark:text-gray-200">
                      Déconnexion
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Logo className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                SolarQuote Pro
              </span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  {mounted && theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50 dark:bg-gray-900">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <span className="sr-only">Ouvrir le menu</span>
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}