'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SunIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { LoginForm } from '@/components/auth/login-form'
import { Logo } from '@/components/ui/logo'

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  // DÉSACTIVATION TEMPORAIRE DE L'AUTHENTIFICATION POUR LE DÉVELOPPEMENT
  // Redirection automatique vers le dashboard
  useEffect(() => {
    // Commenté pour désactiver la redirection automatique
    // window.location.href = '/dashboard'
  }, [])

  const features = [
    {
      icon: SunIcon,
      title: 'Simulation Précise',
      description: 'Calculez automatiquement la production énergétique basée sur l\'orientation et l\'ensoleillement'
    },
    {
      icon: BoltIcon,
      title: 'Calepinage Intelligent',
      description: 'Placez et optimisez vos panneaux solaires directement sur la toiture du client'
    },
    {
      icon: ChartBarIcon,
      title: 'Devis Automatisés',
      description: 'Générez des devis professionnels en quelques minutes avec calcul des économies'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Logo className="h-10 w-auto" />
              <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                SolarQuote Pro
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </button>
                {/* BOUTON DE DÉVELOPPEMENT - À SUPPRIMER EN PRODUCTION */}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Accès Dev Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Créez des devis
            <span className="text-primary-600"> photovoltaïques </span>
            en quelques minutes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Application professionnelle pour les installateurs de panneaux solaires.
            Simulez, calculez et générez des devis précis avec visualisation 3D de la toiture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowLogin(true)}
              className="btn-primary text-lg px-8 py-3"
            >
              Commencer maintenant
            </button>
            <Link
              href="#features"
              className="btn-outline text-lg px-8 py-3"
            >
              Découvrir les fonctionnalités
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Des outils professionnels pour optimiser vos installations photovoltaïques
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Connexion
              </h2>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <LoginForm onSuccess={() => {
              setShowLogin(false)
              router.push('/dashboard')
            }} />
          </div>
        </div>
      )}
    </div>
  )
}