import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Receipt, Plus, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { ProposalItem } from '@/lib/types'

const PACKAGE_TEMPLATES = [
    {
        name: 'Landing Page',
        items: [
            { name: 'Design Moderno', description: '1 página responsiva com design profissional', value: 800, quantity: 1 },
            { name: 'Formulário de Contato', description: 'Captura de leads integrada', value: 200, quantity: 1 },
            { name: 'SEO Básico', description: 'Otimização para Google', value: 300, quantity: 1 }
        ]
    },
    {
        name: 'Site Institucional',
        items: [
            { name: 'Design Personalizado', description: 'Até 5 páginas responsivas', value: 1500, quantity: 1 },
            { name: 'Blog / Notícias', description: 'Sistema de conteúdo', value: 500, quantity: 1 },
            { name: 'Galeria de Fotos', description: 'Portfólio de projetos', value: 300, quantity: 1 },
            { name: 'SEO Avançado', description: 'Otimização completa', value: 500, quantity: 1 }
        ]
    },
    {
        name: 'E-commerce',
        items: [
            { name: 'Loja Online Completa', description: 'Até 50 produtos', value: 3000, quantity: 1 },
            { name: 'Carrinho e Checkout', description: 'Sistema de pagamentos', value: 800, quantity: 1 },
            { name: 'Painel Administrativo', description: 'Gestão de pedidos', value: 700, quantity: 1 },
            { name: 'Integração Frete', description: 'Correios e transportadoras', value: 500, quantity: 1 }
        ]
    }
]

export default function ProposalGenerator() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const leadId = searchParams.get('leadId')

    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_phone: '',
        title: '',
        payment_terms: '50% entrada + 50% entrega',
        delivery_time: '15 dias úteis',
        observations: ''
    })
    const [items, setItems] = useState<ProposalItem[]>([])
    const [discount, setDiscount] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (leadId) {
            loadLeadData()
        }
    }, [leadId])

    const loadLeadData = async () => {
        const { data } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single()

        if (data) {
            setFormData(prev => ({
                ...prev,
                client_name: data.company_name,
                client_email: data.contact_info?.email || '',
                client_phone: data.contact_info?.phone || data.contact_info?.whatsapp || '',
                title: `Proposta de Website para ${data.company_name}`
            }))
        }
    }

    const applyTemplate = (templateIndex: number) => {
        setItems(PACKAGE_TEMPLATES[templateIndex].items)
        setFormData(prev => ({ ...prev, title: `Proposta - ${PACKAGE_TEMPLATES[templateIndex].name}` }))
    }

    const addItem = () => {
        setItems([...items, { name: '', description: '', value: 0, quantity: 1 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof ProposalItem, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.value * item.quantity), 0)
    }

    const calculateFinal = () => {
        const total = calculateTotal()
        return total - (total * discount / 100)
    }

    const handleSubmit = async () => {
        if (!user || items.length === 0 || !formData.client_name) {
            toast.error('Preencha os dados básicos e adicione pelo menos um item')
            return
        }

        setLoading(true)
        try {
            const total_value = calculateTotal()
            const final_value = calculateFinal()

            const { data, error } = await supabase
                .from('proposals')
                .insert({
                    user_id: user.id,
                    lead_id: leadId || null,
                    client_name: formData.client_name,
                    client_email: formData.client_email || null,
                    client_phone: formData.client_phone || null,
                    title: formData.title,
                    payment_terms: formData.payment_terms || null,
                    delivery_time: formData.delivery_time || null,
                    observations: formData.observations || null,
                    items,
                    total_value,
                    discount,
                    final_value
                })
                .select()
                .single()

            if (error) throw error

            toast.success('Proposta criada com sucesso!')

            // Show share options
            const shareUrl = `${window.location.origin}/proposal/${data.share_token}`
            const whatsappText = `Olá ${formData.client_name}! 🎯\n\nFiz uma proposta personalizada para o site de vocês.\n\nConfira: ${shareUrl}`

            navigator.clipboard.writeText(shareUrl)
            setCopied(true)

            toast.success('Link copiado! 📋', {
                description: (
                    <div className="space-y-2 mt-2">
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
                        >
                            Enviar via WhatsApp
                        </a>
                    </div>
                ),
                duration: 10000
            })

            setTimeout(() => navigate('/proposals'), 2000)
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar proposta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Nova Proposta Comercial</h1>
                <p className="text-muted-foreground">Crie propostas profissionais para seus clientes</p>
            </div>

            {/* Templates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PACKAGE_TEMPLATES.map((template, index) => (
                    <Card
                        key={index}
                        className="cursor-pointer hover:border-primary transition-all glass-panel"
                        onClick={() => applyTemplate(index)}
                    >
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-xs text-muted-foreground">
                                {template.items.length} itens - R$ {template.items.reduce((sum, item) => sum + item.value, 0).toLocaleString('pt-BR')}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Form */}
            <Card className="glass-panel">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Dados da Proposta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Client Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Nome do Cliente *</Label>
                            <Input
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                placeholder="Empresa XYZ"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.client_email}
                                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                placeholder="contato@empresa.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input
                                value={formData.client_phone}
                                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Título da Proposta *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Proposta de Desenvolvimento de Website"
                        />
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label className="text-lg">Itens/Serviços</Label>
                            <Button onClick={addItem} variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Adicionar Item
                            </Button>
                        </div>

                        {items.map((item, index) => (
                            <Card key={index} className="p-4 bg-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                    <div className="md:col-span-3">
                                        <Input
                                            placeholder="Nome do serviço"
                                            value={item.name}
                                            onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <Input
                                            placeholder="Descrição"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Valor"
                                            value={item.value}
                                            onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input
                                            type="number"
                                            placeholder="Qtd"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                            min={1}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex items-center justify-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-lg">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Condições de Pagamento</Label>
                                <Input
                                    value={formData.payment_terms}
                                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Prazo de Entrega</Label>
                                <Input
                                    value={formData.delivery_time}
                                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Desconto (%)</Label>
                                <Input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center space-y-3">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-400">
                                    <span>Desconto ({discount}%):</span>
                                    <span>- R$ {(calculateTotal() * discount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-3">
                                <span>Total:</span>
                                <span className="text-primary">R$ {calculateFinal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea
                            value={formData.observations}
                            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                            placeholder="Informações adicionais, condições especiais..."
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={loading || items.length === 0}
                        className="w-full gap-2"
                        size="lg"
                    >
                        {loading ? 'Criando...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Criar e Compartilhar Proposta
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
