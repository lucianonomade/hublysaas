import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface Profile {
    id: string
    email: string
    role: 'admin' | 'user'
    is_active: boolean
}

interface AuthContextType {
    user: User | null
    profile: Profile | null
    loading: boolean
    signUp: (email: string, password: string) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    signInWithMagicLink: (email: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfileData = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('[AUTH] Error fetching profile:', error)
                return null
            }

            return data as Profile
        } catch (err) {
            console.error('[AUTH] Exception fetching profile:', err)
            return null
        }
    }

    useEffect(() => {
        let mounted = true

        // Safety timeout: force loading to false after 5 seconds
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn('[AUTH] Safety timeout triggered - forcing loading to false')
                setLoading(false)
            }
        }, 5000)

        const initialize = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                // If there's an error getting session, clear it and start fresh
                if (sessionError) {
                    console.warn('[AUTH] Session error detected, clearing:', sessionError.message)
                    await supabase.auth.signOut({ scope: 'local' })
                    if (mounted) {
                        setUser(null)
                        setProfile(null)
                        setLoading(false)
                        clearTimeout(safetyTimeout)
                    }
                    return
                }

                if (!mounted) return

                const currentUser = session?.user ?? null
                setUser(currentUser)

                if (currentUser) {
                    const data = await fetchProfileData(currentUser.id)

                    // If profile fetch fails, session might be invalid - clear it
                    if (!data && mounted) {
                        console.warn('[AUTH] Profile not found for user, clearing session')
                        await supabase.auth.signOut({ scope: 'local' })
                        setUser(null)
                        setProfile(null)
                    } else if (mounted) {
                        setProfile(data)
                    }
                }
            } catch (err: any) {
                console.error('[AUTH] Auth initialization error:', err)
                // On any error, clear potentially corrupted session
                try {
                    await supabase.auth.signOut({ scope: 'local' })
                } catch (e) {
                    console.error('[AUTH] Error clearing session:', e)
                }
                if (mounted) {
                    setUser(null)
                    setProfile(null)
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                    clearTimeout(safetyTimeout)
                }
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

            if (mounted) {
                setLoading(false)
                clearTimeout(safetyTimeout)
            }
        })

        return () => {
            mounted = false
            clearTimeout(safetyTimeout)
            subscription.unsubscribe()
        }
    }, [])

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
    }

    const signIn = async (email: string, password: string) => {
        console.log('[AUTH] Starting signIn for:', email)
        console.log('[AUTH] Supabase URL:', supabase.supabaseUrl)

        try {
            console.log('[AUTH] Calling signInWithPassword...')

            const { error, data } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            console.log('[AUTH] Response received:', { error, hasUser: !!data?.user })

            if (error) {
                console.error('[AUTH] Login error:', error)
                throw new Error(error.message)
            }

            if (!data?.user) {
                throw new Error('Credenciais inválidas')
            }

            console.log('[AUTH] Login successful!')
        } catch (e: any) {
            console.error('[AUTH] SignIn exception:', e)
            throw e
        }
    }

    const signInWithMagicLink = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })
        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithMagicLink, signOut }}>
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
