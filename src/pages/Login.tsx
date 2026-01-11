import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { toast } from 'sonner'

export default function Login() {
    const navigate = useNavigate()
    const { signIn, signInWithMagicLink } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [useMagicLink, setUseMagicLink] = useState(false)

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await signIn(email, password)
            toast.success('Login realizado com sucesso!')
            navigate('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao fazer login')
        } finally {
            setLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await signInWithMagicLink(email)
            toast.success('Link mágico enviado! Verifique seu email.')
        } catch (error: any) {
            toast.error(error.message || 'Erro ao enviar link mágico')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <Target className="w-10 h-10 text-primary" />
                        <span className="text-3xl font-bold text-gradient">Hubly</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
                    <p className="text-muted-foreground mt-2">
                        Entre para continuar sua prospecção
                    </p>
                </div>

                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Entrar na conta</CardTitle>
                        <CardDescription>
                            Use seu email e senha ou receba um link mágico
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!useMagicLink ? (
                            <form onSubmit={handleEmailLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Entrando...' : 'Entrar'}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setUseMagicLink(true)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Usar link mágico
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleMagicLink} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enviaremos um link de login para seu email
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Enviando...' : 'Enviar link mágico'}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setUseMagicLink(false)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Voltar para login com senha
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center text-sm">
                            <span className="text-muted-foreground">Acesso restrito para administradores.</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
