import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileText, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { gerarPRD } from '@/lib/groq'

const AI_PLATFORMS = [
    { id: 'lovable', name: 'Lovable', description: 'Full-stack React apps' },
    { id: 'replit', name: 'Replit Agent', description: 'Multi-language development' },
    { id: 'v0', name: 'V0 by Vercel', description: 'React component generation' },
    { id: 'bolt', name: 'Bolt.new', description: 'Full-stack web apps' },
    { id: 'cursor', name: 'Cursor AI', description: 'Code editor assistance' }
]

export default function PRDGenerator() {
    const [step, setStep] = useState(1)
    const [platform, setPlatform] = useState('')
    const [projectData, setProjectData] = useState({
        name: '',
        type: '',
        description: '',
        features: '',
        tech: '',
        design: '',
        extra: ''
    })
    const [generatedPRD, setGeneratedPRD] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const prd = await gerarPRD(projectData, platform)
            setGeneratedPRD(prd)
            setStep(4)
            toast.success('PRD gerado com sucesso!')
        } catch (error) {
            toast.error('Erro ao gerar PRD')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedPRD)
        setCopied(true)
        toast.success('PRD copiado!')
        setTimeout(() => setCopied(false), 2000)
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Escolha a Plataforma AI</h2>
                            <p className="text-muted-foreground">Selecione onde você vai desenvolver</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {AI_PLATFORMS.map((plat) => (
                                <Card
                                    key={plat.id}
                                    className={`cursor-pointer transition-all ${platform === plat.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/10 hover:border-white/20'
                                        }`}
                                    onClick={() => setPlatform(plat.id)}
                                >
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-lg mb-1">{plat.name}</h3>
                                        <p className="text-sm text-muted-foreground">{plat.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <Button
                            onClick={() => setStep(2)}
                            disabled={!platform}
                            className="w-full gap-2"
                            size="lg"
                        >
                            Próximo
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Informações Básicas</h2>
                            <p className="text-muted-foreground">Descreva seu projeto</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nome do Projeto *</Label>
                                <Input
                                    placeholder="Ex: Sistema de Gestão de Leads"
                                    value={projectData.name}
                                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo de Projeto *</Label>
                                <Input
                                    placeholder="Ex: SaaS B2B, E-commerce, Landing Page"
                                    value={projectData.type}
                                    onChange={(e) => setProjectData({ ...projectData, type: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descrição *</Label>
                                <Textarea
                                    placeholder="Descreva o propósito e objetivo do projeto..."
                                    value={projectData.description}
                                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                disabled={!projectData.name || !projectData.type || !projectData.description}
                                className="flex-1 gap-2"
                            >
                                Próximo
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Detalhes Técnicos</h2>
                            <p className="text-muted-foreground">Especifique funcionalidades e preferências</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Funcionalidades Principais</Label>
                                <Textarea
                                    placeholder="Liste as funcionalidades principais (uma por linha)..."
                                    value={projectData.features}
                                    onChange={(e) => setProjectData({ ...projectData, features: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Stack Tecnológica Preferida (Opcional)</Label>
                                <Input
                                    placeholder="Ex: React, TypeScript, Supabase, TailwindCSS"
                                    value={projectData.tech}
                                    onChange={(e) => setProjectData({ ...projectData, tech: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Preferências de Design (Opcional)</Label>
                                <Input
                                    placeholder="Ex: Moderno, Minimalista, Cores: Azul e Branco"
                                    value={projectData.design}
                                    onChange={(e) => setProjectData({ ...projectData, design: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Informações Adicionais (Opcional)</Label>
                                <Textarea
                                    placeholder="Qualquer outra informação relevante..."
                                    value={projectData.extra}
                                    onChange={(e) => setProjectData({ ...projectData, extra: e.target.value })}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                            <Button onClick={handleGenerate} disabled={loading} className="flex-1 gap-2">
                                {loading ? 'Gerando...' : 'Gerar PRD'}
                                <FileText className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">PRD Gerado</h2>
                            <p className="text-muted-foreground">
                                Otimizado para {AI_PLATFORMS.find(p => p.id === platform)?.name}
                            </p>
                        </div>
                        <Card className="glass-panel">
                            <CardContent className="p-6">
                                <pre className="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-auto">
                                    {generatedPRD}
                                </pre>
                            </CardContent>
                        </Card>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                                Criar Novo
                            </Button>
                            <Button onClick={handleCopy} className="flex-1 gap-2">
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Copiar PRD
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">PRD Prompt Generator</h1>
                <p className="text-muted-foreground">Crie prompts detalhados para IAs de desenvolvimento</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                    <>
                        <div
                            key={s}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-muted-foreground'
                                }`}
                        >
                            {s}
                        </div>
                        {s < 4 && (
                            <div className={`h-0.5 w-12 ${step > s ? 'bg-primary' : 'bg-white/10'}`} />
                        )}
                    </>
                ))}
            </div>

            <Card className="glass-panel">
                <CardContent className="p-8">
                    {renderStep()}
                </CardContent>
            </Card>
        </div>
    )
}
