import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Target,
    Users,
    Bot,
    LogOut,
    FileText,
    Receipt,
    Calculator,
    Briefcase,
    Shield,
    Megaphone,
    Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'


export default function Sidebar() {
    const location = useLocation()
    const { signOut, profile } = useAuth()

    console.log('Sidebar Profile Debug:', profile)

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Campanhas', href: '/campaigns', icon: Megaphone },
        { name: 'Leads', href: '/leads', icon: Users },
        { name: 'Agentes IA', href: '/agents', icon: Bot },
        { name: 'Gerador de Sites', href: '/generator', icon: Globe },
        { name: 'PRD Prompt', href: '/prd', icon: FileText },
        { name: 'Propostas', href: '/proposals', icon: Receipt },
        { name: 'Calculadora ROI', href: '/roi-calculator', icon: Calculator },
        { name: 'CRM', href: '/crm', icon: Briefcase },
        // Conditional Admin Link
        ...(profile?.role === 'admin' ? [{ name: 'Super Admin', href: '/admin', icon: Shield }] : []),

    ]

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="flex flex-col h-full glass-panel border-r border-white/10">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Target className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold text-gradient">Hubly</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                        <Link key={item.name} to={item.href}>
                            <div
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50'
                                        : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.name}</span>
                            </div>
                        </Link>
                    )
                })}
            </nav>



            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sair</span>
                </Button>
            </div>
        </div>
    )
}
