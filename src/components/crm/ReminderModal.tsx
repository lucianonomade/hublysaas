import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface ReminderModalProps {
    leadId: string
    onClose: () => void
    onSuccess: () => void
}

export default function ReminderModal({ leadId, onClose, onSuccess }: ReminderModalProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        due_time: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!formData.title.trim() || !formData.due_date) {
            toast.error('Preencha título e data')
            return
        }

        setLoading(true)
        try {
            const dueDateTime = `${formData.due_date}T${formData.due_time || '12:00'}:00`

            const { error } = await supabase
                .from('reminders')
                .insert({
                    lead_id: leadId,
                    user_id: user?.id,
                    title: formData.title,
                    description: formData.description || null,
                    due_date: dueDateTime
                })

            if (error) throw error

            toast.success('Lembrete criado!')
            onSuccess()
        } catch (error) {
            toast.error('Erro ao criar lembrete')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="glass-panel">
                <DialogHeader>
                    <DialogTitle>Criar Lembrete</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Ligar para follow-up"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detalhes adicionais..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data *</Label>
                            <Input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Hora</Label>
                            <Input
                                type="time"
                                value={formData.due_time}
                                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Lembrete'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
