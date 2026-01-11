import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { UserPlus, Shield, Ban, CheckCircle } from 'lucide-react'

interface UserProfile {
    id: string
    email: string
    role: 'user' | 'admin'
    is_active: boolean
    plan: 'manual' | 'pro' | 'enterprise'
    created_at: string
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // New User Form State
    const [newUserEmail, setNewUserEmail] = useState('')
    const [newUserPassword, setNewUserPassword] = useState('')
    const [newUserRole, setNewUserRole] = useState('user')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error: any) {
            toast.error('Erro ao carregar usuários: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        try {
            const { data, error } = await supabase.rpc('create_new_user', {
                new_email: newUserEmail,
                new_password: newUserPassword,
                new_role: newUserRole
            })

            if (error) throw error

            toast.success('Usuário criado com sucesso!')
            setIsCreateOpen(false)
            setNewUserEmail('')
            setNewUserPassword('')
            loadUsers() // Reload list
        } catch (error: any) {
            toast.error('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'))
        } finally {
            setCreating(false)
        }
    }

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId)

            if (error) throw error

            toast.success(`Usuário ${!currentStatus ? 'desbloqueado' : 'bloqueado'}!`)
            loadUsers()
        } catch (error) {
            toast.error('Erro ao atualizar status')
        }
    }

    const updateUserPlan = async (userId: string, plan: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ plan })
                .eq('id', userId)

            if (error) throw error
            toast.success('Plano atualizado!')
            loadUsers()
        } catch (error) {
            toast.error('Erro ao atualizar plano')
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                        Super Admin
                    </h1>
                    <p className="text-muted-foreground">Gerenciamento total de usuários e acessos</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-panel">
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Senha</Label>
                                <Input
                                    type="text"
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Nível de Acesso</Label>
                                <Select value={newUserRole} onValueChange={setNewUserRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">Usuário Comum</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full" disabled={creating}>
                                {creating ? 'Criando...' : 'Criar Conta'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass-panel border-white/10">
                <CardHeader>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                    <CardDescription>
                        Lista completa de todos os usuários do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell>
                                </TableRow>
                            ) : users.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>
                                        <div className="font-medium">{u.email}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{u.id}</div>
                                    </TableCell>
                                    <TableCell>
                                        {u.is_active ? (
                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Ativo</Badge>
                                        ) : (
                                            <Badge variant="destructive">Bloqueado</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {u.role === 'admin' ? (
                                            <div className="flex items-center gap-1 text-purple-400">
                                                <Shield className="w-3 h-3" /> Admin
                                            </div>
                                        ) : 'Usuário'}
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={u.plan}
                                            onValueChange={(val) => updateUserPlan(u.id, val)}
                                        >
                                            <SelectTrigger className="h-7 w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="manual">Manual</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {u.email !== user?.email && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title={u.is_active ? "Bloquear acesso" : "Liberar acesso"}
                                                onClick={() => toggleUserStatus(u.id, u.is_active)}
                                                className={u.is_active ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-green-400 hover:text-green-300 hover:bg-green-900/20"}
                                            >
                                                {u.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
