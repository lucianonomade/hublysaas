import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface InteractionModalProps {
    leadId: string
    onClose: () => void
    onSuccess: () => void
}

export default function InteractionModal({ leadId, onClose, onSuccess }: InteractionModalProps) {
    const { user } = useAuth()
    const [type, setType] = useState<'note' | 'call' | 'email' | 'meeting'>('note')
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error('Digite o conteúdo da interação')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase
                .from('interactions')
                .insert({
                    lead_id: leadId,
                    user_id: user?.id,
                    type,
                    content
                })

            if (error) throw error

            toast.success('Interação adicionada!')
            onSuccess()
        } catch (error) {
            toast.error('Erro ao adicionar interação')
        } finally {
            setLoading(false)
        }
    }

    const types = [
        { value: 'note', label: '📝 Nota' },
        { value: 'call', label: '📞 Ligação' },
        { value: 'email', label: '✉️ Email' },
        { value: 'meeting', label: '🤝 Reunião' }
    ]

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="glass-panel">
                <DialogHeader>
                    <DialogTitle>Adicionar Interação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Interação</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Conteúdo *</Label>
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Descreva o que aconteceu nesta interação..."
                            rows={4}
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
