import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calculator, TrendingUp, DollarSign, Users, Clock } from 'lucide-react'

export default function ROICalculator() {
    const [formData, setFormData] = useState({
        averageTicket: 0,
        monthlyClients: 0,
        conversionRate: 2, // % padrão
        websiteCost: 2000,
        monthlyMaintenance: 50
    })

    const [showResults, setShowResults] = useState(false)

    const calculateROI = () => {
        const { averageTicket, monthlyClients, conversionRate, websiteCost, monthlyMaintenance } = formData

        // Estimativa: site pode aumentar em 30-50% os leads
        const leadIncrease = 0.4 // 40% mais leads com site
        const newMonthlyLeads = monthlyClients * leadIncrease
        const newClients = newMonthlyLeads * (conversionRate / 100)

        // Receita adicional por mês
        const additionalMonthlyRevenue = newClients * averageTicket
        const annualAdditionalRevenue = additionalMonthlyRevenue * 12

        // Custo total primeiro ano
        const firstYearCost = websiteCost + (monthlyMaintenance * 12)

        // ROI e Payback
        const roi = ((annualAdditionalRevenue - firstYearCost) / firstYearCost) * 100
        const paybackMonths = websiteCost / additionalMonthlyRevenue

        // Perda sem site (oportunidade perdida em 1 ano)
        const annualLoss = annualAdditionalRevenue

        return {
            newClients: Math.round(newClients),
            newLeads: Math.round(newMonthlyLeads),
            additionalMonthlyRevenue: Math.round(additionalMonthlyRevenue),
            annualAdditionalRevenue: Math.round(annualAdditionalRevenue),
            firstYearCost: Math.round(firstYearCost),
            roi: Math.round(roi),
            paybackMonths: Math.round(paybackMonths * 10) / 10,
            annualLoss: Math.round(annualLoss)
        }
    }

    const handleCalculate = () => {
        if (formData.averageTicket > 0 && formData.monthlyClients > 0) {
            setShowResults(true)
        }
    }

    const results = showResults ? calculateROI() : null

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calculator className="w-8 h-8 text-primary" />
                    Calculadora de ROI
                </h1>
                <p className="text-muted-foreground">Mostre ao cliente o valor real de ter um site profissional</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card className="glass-panel">
                    <CardHeader>
                        <CardTitle>Dados do Negócio</CardTitle>
                        <CardDescription>Preencha as informações do cliente</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ticket Médio (R$) *</Label>
                            <Input
                                type="number"
                                placeholder="Ex: 150"
                                value={formData.averageTicket || ''}
                                onChange={(e) => setFormData({ ...formData, averageTicket: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Valor médio por venda/serviço</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Leads por Mês *</Label>
                            <Input
                                type="number"
                                placeholder="Ex: 50"
                                value={formData.monthlyClients || ''}
                                onChange={(e) => setFormData({ ...formData, monthlyClients: parseFloat(e.target.value) || 0 })}
                            />
                            <p className="text-xs text-muted-foreground">Quantas pessoas fazem contato por mês</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Taxa de Conversão (%)</Label>
                            <Input
                                type="number"
                                placeholder="Ex: 2"
                                value={formData.conversionRate || ''}
                                onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) || 2 })}
                            />
                            <p className="text-xs text-muted-foreground">% de leads que viram clientes</p>
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-4">
                            <h3 className="font-semibold">Investimento</h3>

                            <div className="space-y-2">
                                <Label>Custo do Site (R$)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 2000"
                                    value={formData.websiteCost || ''}
                                    onChange={(e) => setFormData({ ...formData, websiteCost: parseFloat(e.target.value) || 2000 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Manutenção Mensal (R$)</Label>
                                <Input
                                    type="number"
                                    placeholder="Ex: 50"
                                    value={formData.monthlyMaintenance || ''}
                                    onChange={(e) => setFormData({ ...formData, monthlyMaintenance: parseFloat(e.target.value) || 50 })}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCalculate}
                            disabled={formData.averageTicket === 0 || formData.monthlyClients === 0}
                            className="w-full gap-2"
                            size="lg"
                        >
                            <Calculator className="w-4 h-4" />
                            Calcular ROI
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {results ? (
                    <div className="space-y-4">
                        {/* Perda Anual */}
                        <Card className="glass-panel border-red-500/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-red-500/20 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-red-400 rotate-180" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">Perda Sem Site</h3>
                                        <p className="text-3xl font-bold text-red-400">
                                            R$ {results.annualLoss.toLocaleString('pt-BR')}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">por ano em oportunidades perdidas</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Novos Clientes */}
                        <Card className="glass-panel border-green-500/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-500/20 rounded-lg">
                                        <Users className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">Clientes Adicionais</h3>
                                        <p className="text-3xl font-bold text-green-400">
                                            +{results.newClients}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            por mês com site profissional
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            ≈ {results.newLeads} leads a mais/mês
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Receita Adicional */}
                        <Card className="glass-panel border-primary/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/20 rounded-lg">
                                        <DollarSign className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">Receita Adicional</h3>
                                        <p className="text-2xl font-bold text-primary">
                                            R$ {results.additionalMonthlyRevenue.toLocaleString('pt-BR')}/mês
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            R$ {results.annualAdditionalRevenue.toLocaleString('pt-BR')}/ano
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payback */}
                        <Card className="glass-panel border-orange-500/50">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-orange-500/20 rounded-lg">
                                        <Clock className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">Retorno do Investimento</h3>
                                        <p className="text-3xl font-bold text-orange-400">
                                            {results.paybackMonths} meses
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            ROI de {results.roi}% no primeiro ano
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        <Card className="glass-panel bg-primary/10">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-3">📊 Resumo Executivo</h3>
                                <div className="space-y-2 text-sm">
                                    <p>
                                        ✅ Investimento inicial: <span className="font-semibold">R$ {formData.websiteCost.toLocaleString('pt-BR')}</span>
                                    </p>
                                    <p>
                                        ✅ Custo anual: <span className="font-semibold">R$ {results.firstYearCost.toLocaleString('pt-BR')}</span> (incluindo manutenção)
                                    </p>
                                    <p className="text-green-400 font-semibold">
                                        ✅ Retorno em {results.paybackMonths} meses
                                    </p>
                                    <p className="text-primary font-semibold">
                                        ✅ Lucro adicional no 1º ano: R$ {(results.annualAdditionalRevenue - results.firstYearCost).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <Card className="glass-panel h-full flex items-center justify-center">
                        <CardContent className="text-center p-8">
                            <Calculator className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground">
                                Preencha os dados ao lado e clique em <br />"Calcular ROI" para ver os resultados
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
