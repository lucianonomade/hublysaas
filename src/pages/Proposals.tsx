import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Receipt, Copy, Check, Search, ExternalLink, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Proposal } from '@/lib/types'

export default function Proposals() {
    const { user } = useAuth()
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            loadProposals()
        }
    }, [user])

    const loadProposals = async () => {
        try {
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProposals(data || [])
        } catch (error) {
            toast.error('Erro ao carregar propostas')
        } finally {
            setLoading(false)
        }
    }

    const copyLink = (token: string, id: string) => {
        const link = `${window.location.origin}/proposal/${token}`
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        toast.success('Link copiado!')
        setTimeout(() => setCopiedId(null), 2000)
    }

    const shareWhatsApp = (proposal: Proposal) => {
        const link = `${window.location.origin}/proposal/${proposal.share_token}`
        const message = `Olá ${proposal.client_name}! 🎯\n\nFiz uma proposta personalizada para você.\n\nConfira: ${link}`
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }

    const filteredProposals = proposals.filter(p =>
        p.client_name.toLowerCase().includes(search.toLowerCase()) ||
        p.title.toLowerCase().includes(search.toLowerCase())
    )

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
                    <h1 className="text-3xl font-bold">Propostas Comerciais</h1>
                    <p className="text-muted-foreground">Gerencie suas propostas e acompanhe o status</p>
                </div>
                <Link to="/proposals/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nova Proposta
                    </Button>
                </Link>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar proposta..."
                    className="pl-10 glass-panel"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredProposals.length === 0 ? (
                <Card className="glass-panel">
                    <CardContent className="py-20 text-center">
                        <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-semibold mb-2">
                            {search ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta criada'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {search ? 'Tente buscar por outro termo' : 'Crie sua primeira proposta profissional'}
                        </p>
                        {!search && (
                            <Link to="/proposals/new">
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Criar Proposta
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProposals.map((proposal) => (
                        <Card key={proposal.id} className="glass-panel hover:border-white/20 transition-all">
                            <CardContent className="p-6 space-y-4">
                                {/* Header */}
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold line-clamp-1">{proposal.client_name}</h3>
                                        <Badge variant={
                                            proposal.status === 'accepted' ? 'success' :
                                                proposal.status === 'rejected' ? 'destructive' : 'secondary'
                                        }>
                                            {proposal.status === 'pending' ? 'Pendente' :
                                                proposal.status === 'accepted' ? 'Aceita' : 'Recusada'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {proposal.title}
                                    </p>
                                </div>

                                {/* Value */}
                                <div className="py-3 border-y border-white/10">
                                    <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                                    <p className="text-2xl font-bold text-primary">
                                        R$ {proposal.final_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    {proposal.discount > 0 && (
                                        <p className="text-xs text-green-400">
                                            {proposal.discount}% de desconto aplicado
                                        </p>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    {proposal.client_phone && (
                                        <p>📱 {proposal.client_phone}</p>
                                    )}
                                    {proposal.client_email && (
                                        <p>✉️ {proposal.client_email}</p>
                                    )}
                                    <p>📅 {new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyLink(proposal.share_token, proposal.id)}
                                        className="gap-2"
                                    >
                                        {copiedId === proposal.id ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-3 h-3" />
                                                Copiar Link
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => shareWhatsApp(proposal)}
                                        className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
                                    >
                                        WhatsApp
                                    </Button>
                                </div>

                                {/* View Link */}
                                <a
                                    href={`/proposal/${proposal.share_token}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-xs text-primary hover:underline"
                                >
                                    Ver proposta
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
