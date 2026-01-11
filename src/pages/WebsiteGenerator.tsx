import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Code, Download, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { gerarSiteHTML, gerarSiteCSS } from '@/lib/groq'

export default function WebsiteGenerator() {
    const [loading, setLoading] = useState(false)
    const [businessData, setBusinessData] = useState({
        name: '',
        niche: '',
        description: '',
        colors: '',
        sections: 'Hero, Sobre, Serviços, Contato'
    })
    const [generatedHTML, setGeneratedHTML] = useState('')
    const [generatedCSS, setGeneratedCSS] = useState('')
    const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview')

    const handleGenerate = async () => {
        if (!businessData.name || !businessData.niche) {
            toast.error('Preencha pelo menos o nome e nicho do negócio')
            return
        }

        setLoading(true)
        try {
            toast.info('Gerando HTML...')
            const html = await gerarSiteHTML(businessData)
            setGeneratedHTML(html)

            toast.info('Gerando CSS...')
            const css = await gerarSiteCSS(businessData)
            setGeneratedCSS(css)

            toast.success('Site gerado com sucesso!')
        } catch (error) {
            toast.error('Erro ao gerar site')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!generatedHTML || !generatedCSS) {
            toast.error('Gere o site primeiro')
            return
        }

        // Create HTML file with embedded CSS
        const fullHTML = generatedHTML.replace(
            '</head>',
            `<style>\n${generatedCSS}\n</style>\n</head>`
        )

        // Download as single HTML file
        const blob = new Blob([fullHTML], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${businessData.name.toLowerCase().replace(/\s+/g, '-')}-website.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast.success('Site baixado com sucesso!')
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Motor Próprio</h1>
                <p className="text-muted-foreground">Gere sites profissionais com IA em segundos.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Informações do Negócio
                        </CardTitle>
                        <CardDescription>Preencha os dados para gerar seu site</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Negócio *</Label>
                            <Input
                                id="name"
                                placeholder="Ex: Clínica Smile"
                                value={businessData.name}
                                onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="niche">Nicho/Setor *</Label>
                            <Input
                                id="niche"
                                placeholder="Ex: Odontologia"
                                value={businessData.niche}
                                onChange={(e) => setBusinessData({ ...businessData, niche: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                placeholder="Descreva os serviços, diferenciais, missão..."
                                value={businessData.description}
                                onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="colors">Cores (opcional)</Label>
                            <Input
                                id="colors"
                                placeholder="Ex: azul e branco"
                                value={businessData.colors}
                                onChange={(e) => setBusinessData({ ...businessData, colors: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sections">Seções do Site</Label>
                            <Input
                                id="sections"
                                value={businessData.sections}
                                onChange={(e) => setBusinessData({ ...businessData, sections: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleGenerate}
                                className="flex-1 gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Gerar Site
                                    </>
                                )}
                            </Button>
                            <Button
                                onClick={handleDownload}
                                variant="outline"
                                disabled={!generatedHTML}
                                className="gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Baixar
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview & Code */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Preview do Site</CardTitle>
                        <CardDescription>Visualize como ficará o site gerado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {generatedHTML ? (
                            <div className="space-y-4">
                                {/* Tabs */}
                                <div className="flex gap-2 border-b border-white/10">
                                    <button
                                        onClick={() => setPreviewTab('preview')}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${previewTab === 'preview'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-white'
                                            }`}
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => setPreviewTab('code')}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${previewTab === 'code'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-white'
                                            }`}
                                    >
                                        Código
                                    </button>
                                </div>

                                {/* Preview Tab */}
                                {previewTab === 'preview' && (
                                    <div className="border border-white/10 rounded-lg overflow-hidden bg-white">
                                        <iframe
                                            srcDoc={generatedHTML.replace('</head>', `<style>${generatedCSS}</style></head>`)}
                                            className="w-full h-[600px] bg-white"
                                            title="Preview do Site"
                                            sandbox="allow-same-origin"
                                        />
                                    </div>
                                )}

                                {/* Code Tab */}
                                {previewTab === 'code' && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-sm font-semibold mb-2">HTML ({generatedHTML.length} caracteres)</h3>
                                            <pre className="bg-black/30 p-3 rounded text-xs overflow-auto max-h-64 border border-white/10">
                                                <code>{generatedHTML}</code>
                                            </pre>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold mb-2">CSS ({generatedCSS.length} caracteres)</h3>
                                            <pre className="bg-black/30 p-3 rounded text-xs overflow-auto max-h-64 border border-white/10">
                                                <code>{generatedCSS}</code>
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                                <Code className="w-12 h-12 mb-3 opacity-20" />
                                <p>O preview aparecerá aqui após a geração</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
