import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  // TEMPORARY DEV FIX: Return mock user to bypass authentication
  // TODO: Remove this before production
  console.warn('⚠️ Using mock user for development - remove before production!')
  
  return {
    data: {
      user: {
        id: 'mock-user-id-12345',
        email: 'dev@example.com',
        user_metadata: {
          full_name: 'Développeur Test'
        }
      }
    },
    error: null
  }
  
  // Original code (commented out for development):
  // const { data, error } = await supabase.auth.getUser()
  // return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}
