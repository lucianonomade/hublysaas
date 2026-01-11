import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Brain, MessageSquare, BarChart3, Zap, Target } from 'lucide-react'

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold text-gradient">Hubly</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost">Entrar</Button>
                        </Link>

                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center animate-fade-in-up">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Prospecção de clientes com IA –{' '}
                        <span className="text-gradient">Encontre leads qualificados</span>{' '}
                        em minutos
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Use buscas do Google + agentes de IA para prospectar empresas no Brasil.
                        Economize horas de trabalho manual e foque no que importa: vender.
                    </p>


                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Tudo que você precisa para{' '}
                        <span className="text-gradient">prospectar melhor</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Ferramentas poderosas que automatizam todo o processo de geração de leads
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <Card className="feature-card">
                        <CardHeader>
                            <Search className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Busca via Serper API</CardTitle>
                            <CardDescription>
                                Encontre empresas usando os resultados de busca do Google.
                                Precisão e velocidade em cada pesquisa.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="feature-card">
                        <CardHeader>
                            <Brain className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Agentes IA para qualificação</CardTitle>
                            <CardDescription>
                                Inteligência artificial analisa cada lead e gera scores de
                                qualificação baseados no seu perfil ideal.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="feature-card">
                        <CardHeader>
                            <MessageSquare className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Mensagens personalizadas</CardTitle>
                            <CardDescription>
                                Gere automaticamente emails e mensagens persuasivas
                                personalizadas para cada prospect.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="feature-card">
                        <CardHeader>
                            <BarChart3 className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Dashboard analítico</CardTitle>
                            <CardDescription>
                                Acompanhe métricas, campanhas ativas e performance dos seus
                                leads em tempo real.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="feature-card">
                        <CardHeader>
                            <Zap className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Integrações futuras</CardTitle>
                            <CardDescription>
                                Em breve: integração com WhatsApp, Email, LinkedIn e CRMs
                                para fluxos completos de vendas.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="feature-card">
                        <CardHeader>
                            <Target className="w-12 h-12 text-primary mb-4" />
                            <CardTitle>Foco no mercado brasileiro</CardTitle>
                            <CardDescription>
                                Otimizado para pequenas e médias empresas brasileiras.
                                Suporte em português.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* Pricing Section */}


            {/* Footer */}
            <footer className="border-t border-white/10 mt-20">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-6 h-6 text-primary" />
                                <span className="text-xl font-bold">Hubly</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Prospecção inteligente para o mercado brasileiro.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Produto</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Funcionalidades</li>

                                <li>Casos de uso</li>
                                <li>Roadmap</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Empresa</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Sobre</li>
                                <li>Blog</li>
                                <li>Carreiras</li>
                                <li>Contato</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>Privacidade</li>
                                <li>Termos de uso</li>
                                <li>Segurança</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
                        <p>© 2026 Hubly. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
