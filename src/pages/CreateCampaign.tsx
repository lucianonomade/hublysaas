import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '@/hooks/useCampaigns'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Target, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchLeadsFromSerper } from '@/lib/serper'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { qualificarLead } from '@/lib/groq'
import { isAbortError } from '@/lib/errorUtils'
import { extractContact } from '@/lib/contactExtractor'

export default function CreateCampaign() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { createCampaign } = useCampaigns()
    const [loading, setLoading] = useState(false)
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [formData, setFormData] = useState({
        name: '',
        niche: '',
        city: '',
        results_count: 20
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.name || !formData.niche || !formData.city) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }

        if (!user) return

        setLoading(true)
        try {
            // 0. Fetch Niche Agent Prompt (Quietly)
            const { data: agentData } = await supabase
                .from('ai_agents')
                .select('prompt')
                .eq('user_id', user.id)
                .eq('category', 'niche')
                .maybeSingle()

            const agentPrompt = agentData?.prompt || 'Analise se esta empresa pertence ao nicho: {niche}'

            // 1. Create Campaign
            const campaign = await createCampaign({
                name: formData.name,
                niche: formData.niche,
                city: formData.city,
                results_count: Number(formData.results_count),
                status: 'active'
            })

            if (!campaign) {
                // If createCampaign returns null, the error message is in the hook state
                throw new Error('Falha ao criar campanha')
            }

            toast.info('Buscando leads reais no Google...')

            // 2. Fetch from Serper
            const results = await fetchLeadsFromSerper(
                formData.niche,
                formData.city,
                Number(formData.results_count)
            )

            setProgress({ current: 0, total: results.length })

            // 3. Prepare Batch Insert Leads
            const leadsToInsert = []
            setProgress({ current: 0, total: results.length })

            for (let i = 0; i < results.length; i++) {
                const result = results[i]
                let qualification = { score: 5, reason: 'Análise indisponível' }

                try {
                    const aiResult = await qualificarLead(
                        { company_name: result.title, description: result.snippet },
                        formData.niche,
                        agentPrompt
                    )
                    if (aiResult) qualification = aiResult
                } catch (aiError: any) {
                    if (!isAbortError(aiError)) {
                        console.error('AI Qualification error:', aiError)
                    }
                }

                // Extract contact info from snippet
                const contactInfo = extractContact(result.snippet + ' ' + result.title)

                leadsToInsert.push({
                    campaign_id: campaign.id,
                    user_id: user.id,
                    company_name: result.title,
                    website: result.link,
                    description: result.snippet,
                    qualification_score: qualification.score,
                    ai_analysis: { reason: qualification.reason },
                    contact_info: contactInfo,
                    status: qualification.score > 7 ? 'qualified' : 'new'
                })

                setProgress(prev => ({ ...prev, current: i + 1 }))
            }

            // Perform Batch Insert
            const { error: insertError } = await supabase.from('leads').insert(leadsToInsert)
            if (insertError) throw insertError

            toast.success(`${results.length} leads processados com IA com sucesso!`)
            navigate('/campaigns')
        } catch (error: any) {
            // Always log to console for debugging
            console.error('Campaign creation error:', error)

            // Only show toast if it's NOT an abort error
            if (!isAbortError(error)) {
                toast.error(error.message || 'Erro ao processar prospecção')
            } else {
                console.warn('AbortError silenciado (não crítico)')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => navigate('/campaigns')} className="mb-4">
                    ← Voltar para Campanhas
                </Button>
                <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Nova Campanha</h1>
                </div>
                <p className="text-muted-foreground">
                    Defina o nicho e a localização para começar a atrair leads qualificados.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Configurações da Prospecção</CardTitle>
                        <CardDescription>
                            Nossos agentes usarão essas informações para buscar no Google.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome da Campanha</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Dentistas em Curitiba - Janeiro"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="niche">Nicho / Setor</Label>
                                <Input
                                    id="niche"
                                    placeholder="Ex: Clínicas Odontológicas"
                                    value={formData.niche}
                                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    placeholder="Ex: Curitiba, PR"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade de Leads (Máx 100)</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="10"
                                max="100"
                                value={formData.results_count}
                                onChange={(e) => setFormData({ ...formData, results_count: Number(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Cada lead consome 1 crédito de pesquisa.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        {loading && progress.total > 0 && (
                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Processando leads...</span>
                                    <span>{progress.current} / {progress.total}</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {progress.total > 0 ? 'Salvando Leads...' : 'Buscando no Google...'}
                                </>
                            ) : (
                                <>
                                    <Search className="w-5 h-5" />
                                    Iniciar Prospecção Real
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
