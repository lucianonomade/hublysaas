import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/types'
import { isAbortError } from '@/lib/errorUtils'

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signUp: (email: string, password: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signInWithMagicLink: (email: string) => Promise<void>
    signOut: () => Promise<void>
    refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfileData = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                if (!isAbortError(error)) {
                    console.error('Error fetching profile:', error)
                }
                return null
            }
            return data as Profile
        } catch (e) {
            return null
        }
    }

    const refreshProfile = async () => {
        if (user) {
            const data = await fetchProfileData(user.id)
            setProfile(data)
        }
    }

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!mounted) return

                const currentUser = session?.user ?? null
                setUser(currentUser)

                if (currentUser) {
                    const data = await fetchProfileData(currentUser.id)
                    if (mounted) setProfile(data)
                }
            } catch (err: any) {
                console.error('Auth initialization error:', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        initialize()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return

            const currentUser = session?.user ?? null
            setUser(currentUser)

            if (currentUser) {
                const data = await fetchProfileData(currentUser.id)
                if (mounted) setProfile(data)
            } else {
                if (mounted) setProfile(null)
            }

            if (mounted) setLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
    }

    const signIn = async (email: string, password: string) => {
        console.log('[AUTH] Starting signIn...')
        try {
            // Add timeout to prevent infinite waiting
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timeout - verifique sua conexão')), 10000)
            )

            const loginPromise = supabase.auth.signInWithPassword({ email, password })

            const { error, data } = await Promise.race([loginPromise, timeoutPromise]) as any

            console.log('[AUTH] SignIn response:', error ? 'ERROR' : 'SUCCESS', data)

            if (error) {
                console.error('[AUTH] SignIn error:', error)
                throw error
            }

            if (!data?.user) {
                throw new Error('Usuário ou senha incorretos')
            }

            console.log('[AUTH] SignIn completed successfully')
        } catch (e: any) {
            console.error('[AUTH] Exception in signIn:', e)
            throw new Error(e.message || 'Erro ao fazer login')
        }
    }

    const signInWithMagicLink = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin + '/dashboard' }
        })
        if (error) throw error
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
            setProfile(null)
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        refreshProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
