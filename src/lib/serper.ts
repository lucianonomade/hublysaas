import { supabase } from './supabase'

export interface SerperResult {
    title: string
    link: string
    snippet: string
    position: number
}

// Common marketplace/directory domains where companies without websites are listed
const MARKETPLACE_DOMAINS = [
    'google.com/maps',
    'facebook.com',
    'instagram.com',
    'olx.com',
    'mercadolivre.com',
    'guiamais.com',
    'apontador.com',
    'agendor.com',
    'paginas.com',
    'encontrajaraguá.com',
    'listafacil.com'
]

export async function fetchLeadsFromSerper(niche: string, city: string, count: number = 20) {
    // Query simples focando em WhatsApp
    const query = `${niche} ${city} whatsapp`

    const { data: profile } = await supabase
        .from('profiles')
        .select('serper_api_key')
        .maybeSingle()

    const apiKey = profile?.serper_api_key || import.meta.env.VITE_SERPER_API_KEY

    if (!apiKey) {
        throw new Error('Serper API Key não configurada. Configure em Configurações.')
    }

    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                num: count * 2
            })
        })

        if (!response.ok) {
            throw new Error('Erro ao buscar leads no Serper')
        }

        const data = await response.json()
        const results = (data.organic || []) as SerperResult[]

        // Filter for leads likely WITHOUT own website but WITH WhatsApp
        const filteredLeads = results
            .filter(lead => {
                const snippet = lead.snippet.toLowerCase()
                const link = lead.link.toLowerCase()
                const title = lead.title.toLowerCase()

                // Check if has WhatsApp or phone
                const hasContact =
                    snippet.includes('whatsapp') ||
                    snippet.includes('whatsa') ||
                    title.includes('whatsapp') ||
                    /\d{2}\s?\d{4,5}-?\d{4}/.test(snippet)

                // Prioritize marketplaces
                const isMarketplace = MARKETPLACE_DOMAINS.some(domain => link.includes(domain))

                if (isMarketplace && hasContact) return true

                // Likely own site if has .com.br or .com
                const hasOwnDomain = link.includes('.com.br') || link.includes('.com/')

                return hasContact && !hasOwnDomain
            })
            .slice(0, count)

        return filteredLeads.length > 0 ? filteredLeads : results.slice(0, count)
    } catch (error) {
        console.error('Serper error:', error)
        throw error
    }
}
