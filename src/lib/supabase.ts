import { createClient } from '@supabase/supabase-js'

// Check for runtime environment variables first (injected by docker-entrypoint.sh)
// @ts-ignore
const runtimeEnv = typeof window !== 'undefined' ? window.ENV : {}

const supabaseUrl = runtimeEnv?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = runtimeEnv?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('__VITE')) {
    console.error('Missing or invalid Supabase environment variables!')
    console.error('VITE_SUPABASE_URL:', supabaseUrl)
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
    console.error('Runtime ENV:', runtimeEnv)

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
