export type UserRole = 'user' | 'admin'
export type PlanType = 'free' | 'pro' | 'enterprise'
export type CampaignStatus = 'active' | 'completed' | 'paused'
export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'converted' | 'rejected'
export type AgentCategory = 'niche' | 'approach' | 'closing' | 'support' | 'code' | 'custom'

export interface User {
    id: string
    email: string
    created_at: string
}

export interface Profile {
    id: string
    role: UserRole
    plan: PlanType
    credits: number
    serper_api_key?: string | null
    created_at: string
    updated_at: string
}

export interface AIAgent {
    id: string
    user_id: string
    name: string
    category: AgentCategory
    prompt: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Campaign {
    id: string
    user_id: string
    name: string
    niche: string
    city: string
    results_count: number
    status: CampaignStatus
    filters?: any
    created_at: string
    updated_at: string
}

export interface Lead {
    id: string
    campaign_id: string
    user_id: string
    company_name: string
    website?: string | null
    description?: string | null
    qualification_score?: number | null
    ai_analysis?: any | null
    status: LeadStatus
    stage?: 'novo' | 'contato' | 'proposta' | 'fechado' | 'perdido'
    contact_info?: {
        email?: string
        phone?: string
        whatsapp?: string
        linkedin?: string
    } | null
    notes?: string | null
    created_at: string
    updated_at: string
}

export interface Interaction {
    id: string
    lead_id: string
    user_id: string
    type: 'note' | 'call' | 'email' | 'meeting'
    content: string
    created_at: string
}

export interface Reminder {
    id: string
    lead_id: string
    user_id: string
    title: string
    description?: string | null
    due_date: string
    completed: boolean
    created_at: string
}

export interface Subscription {
    id: string
    user_id: string
    stripe_subscription_id: string
    plan: PlanType
    status: 'active' | 'canceled' | 'past_due'
    current_period_end: string
    created_at: string
    updated_at: string
}

export interface ProposalItem {
    name: string
    description: string
    value: number
    quantity: number
}

export interface Proposal {
    id: string
    user_id: string
    lead_id?: string | null
    client_name: string
    client_email?: string | null
    client_phone?: string | null
    title: string
    items: ProposalItem[]
    total_value: number
    discount: number
    final_value: number
    payment_terms?: string | null
    delivery_time?: string | null
    observations?: string | null
    status: 'pending' | 'accepted' | 'rejected'
    share_token: string
    accepted_at?: string | null
    rejected_at?: string | null
    client_comment?: string | null
    created_at: string
    updated_at: string
}
