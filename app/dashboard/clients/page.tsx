'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { getClients, getCurrentUser, supabase, type Client } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    clientId: string
    clientName: string
  }>({ isOpen: false, clientId: '', clientName: '' })
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClient = (clientId: string, clientName: string) => {
    setDeleteModal({
      isOpen: true,
      clientId,
      clientName
    })
  }

  const confirmDeleteClient = async () => {
    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', deleteModal.clientId)
        .eq('user_id', user?.id || '123e4567-e89b-12d3-a456-426614174000')
      
      if (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression du prospect')
      } else {
        // Mettre à jour la liste locale
        setClients(clients.filter(client => client.id !== deleteModal.clientId))
        setFilteredClients(filteredClients.filter(client => client.id !== deleteModal.clientId))
        // Fermer le modal
        setDeleteModal({ isOpen: false, clientId: '', clientName: '' })
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert('Une erreur inattendue est survenue')
    } finally {
      setIsDeleting(false)
    }
  }

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModal({ isOpen: false, clientId: '', clientName: '' })
    }
  }

  useEffect(() => {
    async function loadClients() {
      try {
        // DÉSACTIVATION TEMPORAIRE DE L'AUTHENTIFICATION POUR LE DÉVELOPPEMENT
        // const currentUser = await getCurrentUser()
        // if (!currentUser) return
        
        // Utilisateur fictif pour le développement
        const mockUser = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'dev@example.com',
          full_name: 'Développeur Test'
        }
        
        setUser(mockUser)
        const { data, error } = await getClients(mockUser.id)
        
        if (error) {
          console.error('Erreur lors du chargement des clients:', error)
        } else {
          setClients(data || [])
          setFilteredClients(data || [])
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadClients()
  }, [])

  useEffect(() => {
    const filtered = clients.filter(client => 
      client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

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
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mes prospects
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Gérez votre base de données prospects
            </p>
          </div>
          <Link
            href="/dashboard/clients/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau prospect
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un prospect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:text-white"
          />
        </div>

        {/* Liste des clients */}
        {filteredClients.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredClients.map((client) => (
                <li key={client.id}>
                  <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            {client.first_name.charAt(0)}{client.last_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.first_name} {client.last_name}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <p>{client.email}</p>
                          <span className="mx-2">•</span>
                          <p>{client.phone}</p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {client.address}, {client.city} {client.postal_code}
                        </p>
                        {client.pdl && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            PDL: {client.pdl}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <p>Ajouté le</p>
                        <p>{formatDate(new Date(client.created_at))}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          href={`/dashboard/clients/${client.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClient(client.id, `${client.first_name} ${client.last_name}`)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Statistiques */}
        {filteredClients.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Statistiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {clients.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Prospects totaux
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {clients.filter(c => c.pdl).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Avec PDL renseigné
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {filteredClients.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Résultats affichés
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteClient}
        title="Supprimer le prospect"
        message={`Êtes-vous sûr de vouloir supprimer le prospect ${deleteModal.clientName} ? Cette action est irréversible et toutes les données associées seront définitivement perdues.`}
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  )
}