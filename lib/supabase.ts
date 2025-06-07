import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données
export interface User {
  id: string
  email: string
  full_name: string
  company_name: string
  role: 'admin' | 'commercial' | 'technicien'
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  pdl: string // Point de livraison
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  client_id: string
  name: string
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  roof_data: {
    address: string
    coordinates: { lat: number; lng: number }
    orientation: number
    tilt: number
    area: number
    obstacles: any[]
  }
  panels_config: {
    panel_count: number
    panel_wattage: number
    panel_positions: { x: number; y: number; rotation: number }[]
  }
  simulation_results: {
    annual_production: number
    annual_savings: number
    monthly_savings: number
    twenty_year_savings: number
    payback_period: number
  }
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  project_id: string
  user_id: string
  client_id: string
  quote_number: string
  total_amount: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  valid_until: string
  items: {
    description: string
    quantity: number
    unit_price: number
    total: number
  }[]
  pdf_url?: string
  created_at: string
  updated_at: string
}

// Fonctions utilitaires pour l'authentification
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Fonctions pour les clients
export async function getClients(userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createClientRecord(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single()
  
  return { data, error }
}

// Fonctions pour les projets
export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single()
  
  return { data, error }
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  return { data, error }
}

// Fonctions pour les devis
export async function getQuotes(userId: string) {
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      project:projects(*),
      client:clients(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

export async function createQuote(quote: Omit<Quote, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quote])
    .select()
    .single()
  
  return { data, error }
}