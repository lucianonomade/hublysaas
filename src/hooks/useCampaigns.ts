import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Campaign } from '@/lib/types'
import { useAuth } from '@/contexts/AuthContext'

export function useCampaigns() {
    const { user } = useAuth()
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user) return

        const fetchCampaigns = async () => {
            try {
                const { data, error } = await supabase
                    .from('campaigns')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setCampaigns(data || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCampaigns()

        // Real-time subscription
        const subscription = supabase
            .channel('campaigns_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'campaigns',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setCampaigns((prev) => [payload.new as Campaign, ...prev])
                    } else if (payload.eventType === 'UPDATE') {
                        setCampaigns((prev) =>
                            prev.map((c) => (c.id === payload.new.id ? (payload.new as Campaign) : c))
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setCampaigns((prev) => prev.filter((c) => c.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [user])

    const createCampaign = async (campaignData: Partial<Campaign>) => {
        if (!user) return null

        const { data, error } = await supabase
            .from('campaigns')
            .insert([{ ...campaignData, user_id: user.id }])
            .select()
            .single()

        if (error) {
            setError(error.message)
            throw error
        }

        return data as Campaign
    }

    const updateCampaignStatus = async (id: string, status: Campaign['status']) => {
        try {
            const { error } = await supabase
                .from('campaigns')
                .update({ status })
                .eq('id', id)

            if (error) throw error
        } catch (err: any) {
            setError(err.message)
        }
    }

    return { campaigns, loading, error, createCampaign, updateCampaignStatus }
}
