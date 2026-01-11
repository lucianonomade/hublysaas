import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Search, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/lib/types'
import LeadDetailSidebar from '@/components/crm/LeadDetailSidebar'
import InteractionModal from '@/components/crm/InteractionModal'
import ReminderModal from '@/components/crm/ReminderModal'

const STAGES = [
    { id: 'novo', name: 'Novo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
    { id: 'contato', name: 'Contato', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
    { id: 'proposta', name: 'Proposta', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
    { id: 'fechado', name: 'Fechado', color: 'bg-green-500/20 text-green-400 border-green-500/50' }
]

export default function CRM() {
    const { user } = useAuth()
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
    const [showInteractionModal, setShowInteractionModal] = useState(false)
    const [showReminderModal, setShowReminderModal] = useState(false)
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

    useEffect(() => {
        if (user) {
            loadLeads()
        }
    }, [user])

    const loadLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setLeads(data || [])
        } catch (error) {
            toast.error('Erro ao carregar leads')
        } finally {
            setLoading(false)
        }
    }

    const updateLeadStage = async (leadId: string, newStage: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ stage: newStage })
                .eq('id', leadId)

            if (error) throw error

            setLeads(leads.map(l => l.id === leadId ? { ...l, stage: newStage as any } : l))
            toast.success('Lead movido com sucesso!')
        } catch (error) {
            toast.error('Erro ao atualizar lead')
        }
    }

    const handleDragStart = (lead: Lead) => {
        setDraggedLead(lead)
    }

    const handleDrop = (stage: string) => {
        if (draggedLead && draggedLead.stage !== stage) {
            updateLeadStage(draggedLead.id, stage)
        }
        setDraggedLead(null)
    }

    const getLeadsByStage = (stage: string) => {
        return leads.filter(l => (l.stage || 'novo') === stage)
            .filter(l =>
                search === '' ||
                l.company_name.toLowerCase().includes(search.toLowerCase()) ||
                l.contact_info?.email?.toLowerCase().includes(search.toLowerCase())
            )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Briefcase className="w-8 h-8 text-primary" />
                        CRM - Pipeline de Vendas
                    </h1>
                    <p className="text-muted-foreground">Gerencie seus leads e oportunidades</p>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar lead..."
                        className="pl-10 glass-panel"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAGES.map((stage) => {
                    const stageLeads = getLeadsByStage(stage.id)

                    return (
                        <div
                            key={stage.id}
                            className="space-y-3"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(stage.id)}
                        >
                            <div className={`p-3 rounded-lg border ${stage.color}`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">{stage.name}</h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {stageLeads.length}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2 min-h-[200px]">
                                {stageLeads.map((lead) => (
                                    <Card
                                        key={lead.id}
                                        draggable
                                        onDragStart={() => handleDragStart(lead)}
                                        onClick={() => setSelectedLead(lead)}
                                        className="glass-panel cursor-pointer hover:border-primary/50 transition-all"
                                    >
                                        <CardContent className="p-4 space-y-2">
                                            <h4 className="font-semibold text-sm">{lead.company_name}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {lead.contact_info?.email || lead.contact_info?.phone || 'Sem contato'}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Modals */}
            {selectedLead && (
                <LeadDetailSidebar
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onAddInteraction={() => setShowInteractionModal(true)}
                    onAddReminder={() => setShowReminderModal(true)}
                />
            )}

            {showInteractionModal && selectedLead && (
                <InteractionModal
                    leadId={selectedLead.id}
                    onClose={() => setShowInteractionModal(false)}
                    onSuccess={() => {
                        setShowInteractionModal(false)
                        loadLeads()
                    }}
                />
            )}

            {showReminderModal && selectedLead && (
                <ReminderModal
                    leadId={selectedLead.id}
                    onClose={() => setShowReminderModal(false)}
                    onSuccess={() => {
                        setShowReminderModal(false)
                        loadLeads()
                    }}
                />
            )}
        </div>
    )
}
