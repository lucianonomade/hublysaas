import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, BarChart2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Campaigns() {
    const navigate = useNavigate()
    const { campaigns, loading } = useCampaigns()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Campanhas</h1>
                    <p className="text-muted-foreground">Gerencie suas prospecções ativas e concluídas.</p>
                </div>
                <Button onClick={() => navigate('/campaigns/new')} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nova Campanha
                </Button>
            </div>

            {campaigns.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-xl">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhuma campanha encontrada</h3>
                    <p className="text-muted-foreground mb-6">Comece sua primeira prospecção agora mesmo.</p>
                    <Button onClick={() => navigate('/campaigns/new')}>
                        Criar Primeira Campanha
                    </Button>
                </div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow>
                                <TableHead>Campanha</TableHead>
                                <TableHead>Nicho / Cidade</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Leads</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign) => (
                                <TableRow key={campaign.id} className="hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium">{campaign.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{campaign.niche}</span>
                                            <span className="text-xs text-muted-foreground">{campaign.city}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            campaign.status === 'active' ? 'default' :
                                                campaign.status === 'completed' ? 'success' : 'secondary'
                                        }>
                                            {campaign.status === 'active' ? 'Ativa' :
                                                campaign.status === 'completed' ? 'Concluída' : 'Pausada'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{campaign.results_count}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {format(new Date(campaign.created_at), "dd 'de' MMM", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <BarChart2 className="w-4 h-4" />
                                            Ver Leads
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
