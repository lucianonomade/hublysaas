import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useLeads } from '@/hooks/useLeads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Users, Target, Plus, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { campaigns, loading: campaignsLoading } = useCampaigns()
    const { leads, loading: leadsLoading } = useLeads()

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const leadsThisMonth = leads.filter(l => {
        const date = new Date(l.created_at)
        const now = new Date()
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length

    const recentCampaigns = campaigns.slice(0, 3)

    if (campaignsLoading || leadsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        Bem-vindo, {user?.email?.split('@')[0]}! 👋
                    </h1>
                    <p className="text-muted-foreground">
                        Aqui está um resumo em tempo real da sua atividade
                    </p>
                </div>
                <Button onClick={() => navigate('/campaigns/new')} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" />
                    Nova Prospecção
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="stat-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Leads este mês</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leadsThisMonth}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-green-500">Qualificados</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="stat-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Campanhas ativas</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCampaigns}</div>
                        <p className="text-xs text-muted-foreground mt-1">Prospectando agora</p>
                    </CardContent>
                </Card>



                <Card className="stat-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Qualificação</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {leads.length > 0 ? Math.round((leads.filter(l => (l.qualification_score || 0) > 7).length / leads.length) * 100) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Leads com score {'>'} 7
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Campaigns */}
            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Campanhas Recentes</CardTitle>
                            <CardDescription>Suas últimas atividades de prospecção</CardDescription>
                        </div>
                        <Link to="/campaigns">
                            <Button variant="ghost" size="sm">
                                Ver todas
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentCampaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Target className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{campaign.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {campaign.results_count} leads
                                            </span>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(campaign.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                    {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
                                </Badge>
                            </div>
                        ))}

                        {campaigns.length === 0 && (
                            <div className="text-center py-12">
                                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <p className="text-muted-foreground">Nenhuma campanha ainda</p>
                                <Button
                                    onClick={() => navigate('/campaigns/new')}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    Criar sua primeira campanha
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
