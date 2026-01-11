import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Copy, Send, Check } from 'lucide-react'
import { gerarMensagemAbordagem } from '@/lib/groq'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface LeadMessageModalProps {
    lead: any | null
    onClose: () => void
}

export function LeadMessageModal({ lead, onClose }: LeadMessageModalProps) {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        if (!lead || !user) return
        setLoading(true)
        try {
            // 1. Fetch Approach Agent Prompt
            const { data: agent } = await supabase
                .from('ai_agents')
                .select('prompt')
                .eq('user_id', user.id)
                .eq('category', 'approach')
                .single()

            const agentPrompt = agent?.prompt || 'Crie uma mensagem de abordagem para {company_name} focada em {niche}'

            // 2. Generate with Groq
            // We need to fetch the campaign niche first
            const { data: campaign } = await supabase
                .from('campaigns')
                .select('niche')
                .eq('id', lead.campaign_id)
                .single()

            const content = await gerarMensagemAbordagem(lead, campaign?.niche || 'Geral', agentPrompt)
            setMessage(content)
        } catch (error) {
            toast.error('Erro ao gerar mensagem')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (message) {
            navigator.clipboard.writeText(message)
            setCopied(true)
            toast.success('Copiado para a área de transferência')
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog open={!!lead} onOpenChange={() => onClose()}>
            <DialogContent className="max-w-md glass-panel">
                <DialogHeader>
                    <DialogTitle>Abordagem para {lead?.company_name}</DialogTitle>
                    <DialogDescription>
                        Use nossa IA para criar uma mensagem personalizada irresistível.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">O agente de abordagem está escrevendo...</p>
                        </div>
                    ) : message ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-sm whitespace-pre-wrap leading-relaxed">
                                {message}
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1 gap-2" onClick={handleCopy}>
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    Copiar Mensagem
                                </Button>
                                <Button variant="outline" className="gap-2" onClick={() => setMessage(null)}>
                                    Regerar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Button className="gap-2" onClick={handleGenerate}>
                                <Send className="w-4 h-4" />
                                Gerar Mensagem Personalizada
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
