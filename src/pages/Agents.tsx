import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Target, MessageSquare, Zap, HelpCircle, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { qualificarLead, gerarMensagemAbordagem, gerarEstrategiaFechamento, gerarRespostaSuporte } from '@/lib/groq'
import { supabase } from '@/lib/supabase'

type AgentType = 'niche' | 'approach' | 'closing' | 'support'

export default function Agents() {
    const { user } = useAuth()
    const [selectedAgent, setSelectedAgent] = useState<AgentType>('niche')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string>('')

    // Form states
    const [companyName, setCompanyName] = useState('')
    const [niche, setNiche] = useState('')
    const [city, setCity] = useState('')
    const [description, setDescription] = useState('')
    const [website, setWebsite] = useState('')
    const [question, setQuestion] = useState('')

    const agents = [
        {
            type: 'niche' as AgentType,
            name: 'Agente de Nicho',
            icon: Target,
            color: 'text-blue-400',
            description: 'Analisa se uma empresa pertence ao seu nicho alvo'
        },
        {
            type: 'approach' as AgentType,
            name: 'Agente de Abordagem',
            icon: MessageSquare,
            color: 'text-purple-400',
            description: 'Cria mensagens personalizadas de abordagem'
        },
        {
            type: 'closing' as AgentType,
            name: 'Agente de Fechamento',
            icon: Zap,
            color: 'text-yellow-400',
            description: 'Gera estratégias para fechar negócios'
        },
        {
            type: 'support' as AgentType,
            name: 'Agente de Suporte',
            icon: HelpCircle,
            color: 'text-green-400',
            description: 'Responde dúvidas comuns dos clientes'
        }
    ]

    const handleGenerate = async () => {
        if (!user) return

        setLoading(true)
        setResult('')

        try {
            // Fetch agent prompt from database
            const { data: agentData } = await supabase
                .from('ai_agents')
                .select('prompt')
                .eq('user_id', user.id)
                .eq('category', selectedAgent)
                .maybeSingle()

            const agentPrompt = agentData?.prompt || getDefaultPrompt(selectedAgent)

            let output = ''

            switch (selectedAgent) {
                case 'niche':
                    if (!companyName || !description || !niche) {
                        toast.error('Preencha todos os campos obrigatórios')
                        return
                    }
                    const qualification = await qualificarLead(
                        { company_name: companyName, description },
                        niche,
                        agentPrompt
                    )
                    output = `**Pontuação:** ${qualification.score}/10\n\n**Análise:** ${qualification.reason}`
                    break

                case 'approach':
                    if (!companyName || !niche) {
                        toast.error('Preencha todos os campos obrigatórios')
                        return
                    }
                    output = await gerarMensagemAbordagem(
                        { company_name: companyName, website },
                        niche,
                        agentPrompt
                    )
                    break

                case 'closing':
                    if (!companyName || !city || !niche) {
                        toast.error('Preencha todos os campos obrigatórios')
                        return
                    }
                    output = await gerarEstrategiaFechamento(companyName, city, niche, agentPrompt)
                    break

                case 'support':
                    if (!companyName || !question) {
                        toast.error('Preencha todos os campos obrigatórios')
                        return
                    }
                    output = await gerarRespostaSuporte(companyName, question, agentPrompt)
                    break
            }

            setResult(output)
            toast.success('Conteúdo gerado com sucesso!')
        } catch (error) {
            toast.error('Erro ao gerar conteúdo')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getDefaultPrompt = (type: AgentType): string => {
        const defaults: Record<AgentType, string> = {
            niche: 'Você é um especialista em vendas. Analise se esta empresa seria um bom cliente para quem vende sites e serviços digitais no nicho: {niche}. Seja crítico e honesto.',
            approach: 'Você é um vendedor de sites e serviços digitais. Crie uma mensagem persuasiva oferecendo SEUS serviços de criação de sites PARA {company_name}. Mostre como um site profissional pode ajudar o negócio deles no nicho {niche} a crescer, atrair mais clientes e aumentar vendas. Seja direto e focado nos benefícios para O NEGÓCIO DELES.',
            closing: 'Você é um closer profissional vendendo sites. Ajude a convencer {company_name} em {city} a CONTRATAR VOCÊ para criar um site profissional. Enfatize ROI, benefícios locais e por que precisam de um site moderno AGORA.',
            support: 'Você é um consultor de vendas de sites. Responda de forma clara as dúvidas do cliente {company_name} sobre CONTRATAR seus serviços de desenvolvimento web, preços, prazos, etc.'
        }
        return defaults[type]
    }

    const currentAgent = agents.find(a => a.type === selectedAgent)!

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Agentes IA Interativos</h1>
                <p className="text-muted-foreground">Selecione um agente, preencha os dados e gere conteúdo com IA.</p>
            </div>

            {/* Agent Selection */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {agents.map((agent) => {
                    const Icon = agent.icon
                    const isSelected = selectedAgent === agent.type
                    return (
                        <Card
                            key={agent.type}
                            className={`cursor-pointer transition-all ${isSelected
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                : 'border-white/10 hover:border-white/20'
                                }`}
                            onClick={() => {
                                setSelectedAgent(agent.type)
                                setResult('')
                            }}
                        >
                            <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Icon className={`w-8 h-8 ${agent.color}`} />
                                    <h3 className="font-semibold text-sm">{agent.name}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card className="glass-panel">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-lg">
                                <currentAgent.icon className={`w-5 h-5 ${currentAgent.color}`} />
                            </div>
                            <div>
                                <CardTitle>{currentAgent.name}</CardTitle>
                                <CardDescription>{currentAgent.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Common Fields */}
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Nome da Empresa *</Label>
                            <Input
                                id="companyName"
                                placeholder="Ex: Clínica Smile"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        {/* Agent-specific fields */}
                        {selectedAgent === 'niche' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Descrição da Empresa *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Descreva o que a empresa faz..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="niche">Nicho Alvo *</Label>
                                    <Input
                                        id="niche"
                                        placeholder="Ex: Clínicas Odontológicas"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedAgent === 'approach' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="niche">Nicho *</Label>
                                    <Input
                                        id="niche"
                                        placeholder="Ex: Clínicas Odontológicas"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website (Opcional)</Label>
                                    <Input
                                        id="website"
                                        placeholder="https://exemplo.com"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedAgent === 'closing' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Cidade *</Label>
                                    <Input
                                        id="city"
                                        placeholder="Ex: Curitiba, PR"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="niche">Nicho *</Label>
                                    <Input
                                        id="niche"
                                        placeholder="Ex: Clínicas Odontológicas"
                                        value={niche}
                                        onChange={(e) => setNiche(e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedAgent === 'support' && (
                            <div className="space-y-2">
                                <Label htmlFor="question">Dúvida do Cliente *</Label>
                                <Textarea
                                    id="question"
                                    placeholder="Ex: Quais são os horários de atendimento?"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            className="w-full gap-2"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Gerando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Gerar com IA
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Output */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Resultado Gerado</CardTitle>
                        <CardDescription>O conteúdo aparecerá aqui após a geração</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result ? (
                            <div className="prose prose-invert max-w-none">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4 whitespace-pre-wrap">
                                    {result}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                                <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                                <p>Aguardando geração...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
