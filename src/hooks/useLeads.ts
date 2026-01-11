import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Lead } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

export function useLeads(campaignId?: string) {
    const { user } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const fetchLeads = async () => {
            try {
                let query = supabase
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (campaignId) {
                    query = query.eq('campaign_id', campaignId)
                } else {
                    query = query.eq('user_id', user.id)
                }

                const { data, error } = await query

                if (error) throw error
                setLeads(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchLeads()

        // Real-time subscription
        const channelName = campaignId ? `leads_campaign_${campaignId}` : `leads_user_${user.id}`
        const filter = campaignId ? `campaign_id=eq.${campaignId}` : `user_id=eq.${user.id}`

        const subscription = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'leads',
                    filter: filter,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLeads((prev) => [payload.new as Lead, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setLeads((prev) =>
                            prev.map((l) => (l.id === payload.new.id ? (payload.new as Lead) : l))
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setLeads((prev) => prev.filter((l) => l.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user, campaignId])

    const updateLeadStatus = async (id: string, status: Lead['status']) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status })
                .eq('id', id)

            if (error) throw error
        } catch (err: any) {
            setError(err.message)
        }
    }

    return { leads, loading, error, updateLeadStatus }
}
