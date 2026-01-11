import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables!')
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')

    // In production, show a user-friendly error
    if (import.meta.env.PROD) {
        throw new Error('Application configuration error. Please contact support.')
    } else {
        throw new Error('Missing Supabase environment variables. Check your .env file.')
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'hubly-auth',
    }
})
