import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Receipt, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Proposal } from '@/lib/types'

export default function ProposalPublic() {
    const { token } = useParams()
    const [proposal, setProposal] = useState<Proposal | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [comment, setComment] = useState('')

    useEffect(() => {
        loadProposal()
    }, [token])

    const loadProposal = async () => {
        try {
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('share_token', token)
                .single()

            if (error) throw error
            setProposal(data)
        } catch (error) {
            toast.error('Proposta não encontrada')
        } finally {
            setLoading(false)
        }
    }

    const handleDecision = async (accept: boolean) => {
        if (!proposal) return

        setSubmitting(true)
        try {
            const { error } = await supabase
                .from('proposals')
                .update({
                    status: accept ? 'accepted' : 'rejected',
                    [accept ? 'accepted_at' : 'rejected_at']: new Date().toISOString(),
                    client_comment: comment || null
                })
                .eq('id', proposal.id)

            if (error) throw error

            toast.success(accept ? 'Proposta aceita! 🎉' : 'Resposta enviada')
            setProposal({ ...proposal, status: accept ? 'accepted' : 'rejected' })
        } catch (error) {
            toast.error('Erro ao processar resposta')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    if (!proposal) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Proposta não encontrada</h2>
                        <p className="text-muted-foreground">O link pode estar incorreto ou expirado.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isDecided = proposal.status !== 'pending'

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center">
                    <Receipt className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Proposta Comercial</h1>
                    {isDecided && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${proposal.status === 'accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {proposal.status === 'accepted' ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Proposta Aceita
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4" />
                                    Proposta Recusada
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Proposal Content */}
                <Card className="glass-panel">
                    <CardContent className="p-8 space-y-6">
                        {/* Title */}
                        <div className="text-center border-b border-white/10 pb-6">
                            <h2 className="text-2xl font-bold mb-2">{proposal.title}</h2>
                            <p className="text-muted-foreground">Para: {proposal.client_name}</p>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Itens/Serviços</h3>
                            {proposal.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start p-4 bg-white/5 rounded-lg">
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Quantidade: {item.quantity}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="font-semibold">
                                            R$ {(item.value * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-muted-foreground">
                                                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-white/10 pt-4">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>R$ {proposal.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {proposal.discount > 0 && (
                                <div className="flex justify-between text-sm text-green-400">
                                    <span>Desconto ({proposal.discount}%):</span>
                                    <span>- R$ {(proposal.total_value * proposal.discount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-2xl font-bold border-t border-white/10 pt-3">
                                <span>Total:</span>
                                <span className="text-primary">R$ {proposal.final_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Terms */}
                        {(proposal.payment_terms || proposal.delivery_time) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/5 rounded-lg">
                                {proposal.payment_terms && (
                                    <div>
                                        <p className="text-sm font-semibold mb-1">Condições de Pagamento</p>
                                        <p className="text-sm text-muted-foreground">{proposal.payment_terms}</p>
                                    </div>
                                )}
                                {proposal.delivery_time && (
                                    <div>
                                        <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Prazo de Entrega
                                        </p>
                                        <p className="text-sm text-muted-foreground">{proposal.delivery_time}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Observations */}
                        {proposal.observations && (
                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-sm font-semibold mb-2">Observações</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.observations}</p>
                            </div>
                        )}

                        {/* Decision Section */}
                        {!isDecided && (
                            <div className="space-y-4 border-t border-white/10 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Comentário (opcional)</label>
                                    <Textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Deixe um comentário ou dúvida..."
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDecision(false)}
                                        disabled={submitting}
                                        className="gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Recusar
                                    </Button>
                                    <Button
                                        onClick={() => handleDecision(true)}
                                        disabled={submitting}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Check className="w-4 h-4" />
                                        Aceitar Proposta
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Decision Made */}
                        {isDecided && proposal.client_comment && (
                            <div className="p-4 bg-white/5 rounded-lg border-t border-white/10 pt-6">
                                <p className="text-sm font-semibold mb-2">Comentário do Cliente</p>
                                <p className="text-sm text-muted-foreground">{proposal.client_comment}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
