import { useLeads } from '@/hooks/useLeads'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, ExternalLink, MessageSquare, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { LeadMessageModal } from '@/components/leads/LeadMessageModal'

export default function Leads() {
    const { leads, loading } = useLeads()
    const [search, setSearch] = useState('')
    const [selectedLead, setSelectedLead] = useState<any | null>(null)

    const filteredLeads = leads.filter(lead =>
        lead.company_name.toLowerCase().includes(search.toLowerCase()) ||
        lead.website?.toLowerCase().includes(search.toLowerCase())
    )

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
                    <h1 className="text-3xl font-bold">Leads</h1>
                    <p className="text-muted-foreground">Todos os leads qualificados encontrados pelos seus agentes.</p>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar empresa ou site..."
                    className="pl-10 glass-panel"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filteredLeads.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-xl">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum lead encontrado</h3>
                    <p className="text-muted-foreground">Inicie uma campanha para começar a popular sua lista.</p>
                </div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Site</TableHead>
                                <TableHead>Score IA</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contatos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.map((lead) => (
                                <TableRow key={lead.id} className="hover:bg-white/5 transition-colors">
                                    <TableCell className="font-medium">{lead.company_name}</TableCell>
                                    <TableCell>
                                        {lead.website ? (
                                            <a
                                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary hover:underline"
                                            >
                                                {lead.website.replace('https://', '').replace('www.', '')}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {lead.qualification_score ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            lead.qualification_score > 7 ? "bg-green-500" :
                                                                lead.qualification_score > 4 ? "bg-yellow-500" : "bg-red-500"
                                                        )}
                                                        style={{ width: `${lead.qualification_score * 10}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-bold">{lead.qualification_score}/10</span>
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            lead.status === 'qualified' ? 'success' :
                                                lead.status === 'new' ? 'secondary' : 'default'
                                        }>
                                            {lead.status === 'new' ? 'Novo' :
                                                lead.status === 'qualified' ? 'Qualificado' : lead.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs gap-1">
                                            {lead.contact_info?.whatsapp || lead.contact_info?.phone ? (
                                                <>
                                                    <span className="font-medium text-green-400">
                                                        📱 {lead.contact_info.whatsapp || lead.contact_info.phone}
                                                    </span>
                                                    {lead.contact_info.whatsapp && (
                                                        <span className="text-[10px] text-muted-foreground">WhatsApp</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">N/A</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            Mensagem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <LeadMessageModal
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
            />
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
