import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Bell, Mail, Phone, Calendar, CheckCircle2, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Lead, Interaction, Reminder } from '@/lib/types'

interface LeadDetailSidebarProps {
    lead: Lead
    onClose: () => void
    onAddInteraction: () => void
    onAddReminder: () => void

}

export default function LeadDetailSidebar({ lead, onClose, onAddInteraction, onAddReminder }: LeadDetailSidebarProps) {
    const [interactions, setInteractions] = useState<Interaction[]>([])
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [lead.id])

    const loadData = async () => {
        try {
            const [interactionsRes, remindersRes] = await Promise.all([
                supabase.from('interactions').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
                supabase.from('reminders').select('*').eq('lead_id', lead.id).order('due_date', { ascending: true })
            ])

            setInteractions(interactionsRes.data || [])
            setReminders(remindersRes.data || [])
        } catch (error) {
            toast.error('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    const toggleReminder = async (id: string, completed: boolean) => {
        try {
            const { error } = await supabase
                .from('reminders')
                .update({ completed: !completed })
                .eq('id', id)

            if (error) throw error
            loadData()
        } catch (error) {
            toast.error('Erro ao atualizar lembrete')
        }
    }

    const getInteractionIcon = (type: string) => {
        switch (type) {
            case 'call': return <Phone className="w-4 h-4" />
            case 'email': return <Mail className="w-4 h-4" />
            case 'meeting': return <Calendar className="w-4 h-4" />
            default: return <MessageSquare className="w-4 h-4" />
        }
    }

    return (
        <Sheet open={true} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-2xl glass-panel overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-2xl">{lead.company_name}</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Contact Info */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground">Informações de Contato</h3>
                        {lead.contact_info?.email && (
                            <p className="text-sm flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {lead.contact_info.email}
                            </p>
                        )}
                        {lead.contact_info?.phone && (
                            <p className="text-sm flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                {lead.contact_info.phone}
                            </p>
                        )}
                        {lead.website && (
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {lead.website}
                            </a>
                        )}
                    </div>

                    <Separator />

                    {/* Reminders */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Lembretes ({reminders.length})
                            </h3>
                            <Button size="sm" variant="outline" onClick={onAddReminder}>
                                + Novo
                            </Button>
                        </div>

                        {loading ? (
                            <p className="text-sm text-muted-foreground">Carregando...</p>
                        ) : reminders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum lembrete</p>
                        ) : (
                            <div className="space-y-2">
                                {reminders.map((reminder) => (
                                    <div
                                        key={reminder.id}
                                        className={`p-3 rounded-lg border ${reminder.completed ? 'bg-white/5 opacity-60' : 'bg-orange-500/10 border-orange-500/30'}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <button
                                                onClick={() => toggleReminder(reminder.id, reminder.completed)}
                                                className="mt-1"
                                            >
                                                {reminder.completed ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-orange-400" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <p className={`font-medium text-sm ${reminder.completed ? 'line-through' : ''}`}>
                                                    {reminder.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(reminder.due_date).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Interactions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Histórico ({interactions.length})
                            </h3>
                            <Button size="sm" variant="outline" onClick={onAddInteraction}>
                                + Nova
                            </Button>
                        </div>

                        {loading ? (
                            <p className="text-sm text-muted-foreground">Carregando...</p>
                        ) : interactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhuma interação registrada</p>
                        ) : (
                            <div className="space-y-3">
                                {interactions.map((interaction) => (
                                    <div key={interaction.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="p-1.5 bg-primary/20 rounded">
                                                {getInteractionIcon(interaction.type)}
                                            </div>
                                            <div className="flex-1">
                                                <Badge variant="secondary" className="text-xs mb-1">
                                                    {interaction.type === 'call' ? '📞 Ligação' :
                                                        interaction.type === 'email' ? '✉️ Email' :
                                                            interaction.type === 'meeting' ? '🤝 Reunião' : '📝 Nota'}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(interaction.created_at).toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm whitespace-pre-wrap">{interaction.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
