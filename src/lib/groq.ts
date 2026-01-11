import Groq from 'groq-sdk'

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Since we are in a client-side demo
})

export async function qualificarLead(leadData: any, niche: string, agentPrompt: string) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `${agentPrompt}\n\nResponda APENAS em JSON no formato: { "score": number (1-10), "reason": "string curtíssima em PT-BR" }`
                },
                {
                    role: 'user',
                    content: `Dados do Lead:\nEmpresa: ${leadData.company_name}\nDescrição: ${leadData.description}\nNicho Alvo: ${niche}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        return content ? JSON.parse(content) : { score: 5, reason: 'Erro na análise' }
    } catch (error) {
        console.error('Groq qualification error:', error)
        return { score: 5, reason: 'Erro de conexão com Groq' }
    }
}

export async function gerarMensagemAbordagem(leadData: any, niche: string, agentPrompt: string) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: agentPrompt
                },
                {
                    role: 'user',
                    content: `Crie uma mensagem curta e persuasiva para:\nEmpresa: ${leadData.company_name}\nNicho: ${niche}\nSite: ${leadData.website}`
                }
            ],
            model: 'llama-3.3-70b-versatile'
        })

        return response.choices[0]?.message?.content || 'Erro ao gerar mensagem'
    } catch (error) {
        console.error('Groq message error:', error)
        return 'Erro de conexão com o agente de abordagem'
    }
}

export async function gerarEstrategiaFechamento(companyName: string, city: string, niche: string, agentPrompt: string) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: agentPrompt
                },
                {
                    role: 'user',
                    content: `Ajude a fechar o negócio com:\nEmpresa: ${companyName}\nCidade: ${city}\nNicho: ${niche}`
                }
            ],
            model: 'llama-3.3-70b-versatile'
        })

        return response.choices[0]?.message?.content || 'Erro ao gerar estratégia'
    } catch (error) {
        console.error('Groq closing error:', error)
        return 'Erro de conexão com o agente de fechamento'
    }
}

export async function gerarRespostaSuporte(companyName: string, question: string, agentPrompt: string) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: agentPrompt
                },
                {
                    role: 'user',
                    content: `Cliente: ${companyName}\nDúvida: ${question}`
                }
            ],
            model: 'llama-3.3-70b-versatile'
        })

        return response.choices[0]?.message?.content || 'Erro ao gerar resposta'
    } catch (error) {
        console.error('Groq support error:', error)
        return 'Erro de conexão com o agente de suporte'
    }
}

export async function gerarSiteHTML(businessData: any) {
    try {
        const prompt = `Crie um site HTML5 moderno e profissional para:

Negócio: ${businessData.name}
Nicho: ${businessData.niche}
Descrição: ${businessData.description}
Cores: ${businessData.colors || 'azul e branco'}
Seções: ${businessData.sections || 'Hero, Sobre, Serviços, Contato'}

Retorne APENAS o código HTML completo, sem explicações. Use classes semânticas e Bootstrap 5 via CDN. Inclua:
- Meta tags SEO
- Estrutura responsiva
- Seções bem definidas
- Call-to-actions
- Formulário de contato
- Footer com redes sociais`

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Você é um desenvolvedor web expert. Gere código HTML5 moderno, semântico e responsivo.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7
        })

        return response.choices[0]?.message?.content || '<!-- Erro ao gerar HTML -->'
    } catch (error) {
        console.error('Groq HTML error:', error)
        return '<!-- Erro de conexão com o gerador -->'
    }
}

export async function gerarSiteCSS(businessData: any) {
    try {
        const prompt = `Crie CSS customizado para o site:

Negócio: ${businessData.name}
Nicho: ${businessData.niche}
Cores primárias: ${businessData.colors || 'azul e branco'}
Estilo: Moderno, minimalista, profissional

Retorne APENAS o código CSS, sem explicações. Inclua:
- Variáveis CSS para cores
- Tipografia moderna
- Animações suaves
- Responsividade
- Hover effects
- Gradientes e sombras modernas`

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Você é um designer CSS expert. Gere código CSS moderno, responsivo e bem organizado.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7
        })

        return response.choices[0]?.message?.content || '/* Erro ao gerar CSS */'
    } catch (error) {
        console.error('Groq CSS error:', error)
        return '/* Erro de conexão com o gerador */'
    }
}

export async function gerarPRD(projectData: any, platform: string) {
    try {
        const platformInstructions: Record<string, string> = {
            lovable: 'Lovable.dev - foque em componentes React modernos, TypeScript, Supabase e TailwindCSS. Seja muito específico sobre UI/UX.',
            replit: 'Replit Agent - seja claro sobre a estrutura de pastas, dependências e comandos de instalação. Especifique linguagem.',
            v0: 'V0 by Vercel - foque em componentes React isolados, props, estados e design system. Use shadcn/ui se possível.',
            bolt: 'Bolt.new - descreva a arquitetura full-stack, rotas, APIs e integrações. Seja detalhado sobre backend e frontend.',
            cursor: 'Cursor AI - organize por arquivos, especifique mudanças incrementais e padrões de código. Seja preciso.'
        }

        const prompt = `Você é um especialista em criar Product Requirements Documents (PRDs) para IAs de desenvolvimento.

Crie um PRD EXTREMAMENTE DETALHADO para ${platformInstructions[platform]}

**INFORMAÇÕES DO PROJETO:**
Nome: ${projectData.name}
Tipo: ${projectData.type}
Descrição: ${projectData.description}
Funcionalidades: ${projectData.features || 'Não especificado'}
Tech Stack: ${projectData.tech || 'Usar padrões da plataforma'}
Design: ${projectData.design || 'Moderno e profissional'}
Observações: ${projectData.extra || 'Nenhuma'}

**FORMATO DO PRD:**

# ${projectData.name}

## 1. Visão Geral
[Descrição do projeto e objetivos]

## 2. Público-Alvo
[Para quem é este projeto]

## 3. Funcionalidades Principais
[Lista detalhada de cada funcionalidade]

## 4. Requisitos Técnicos
[Stack, arquitetura, integrações]

## 5. Design e UX
[Especificações visuais e de experiência]

## 6. Estrutura de Arquivos
[Organização do código]

## 7. Fluxos de Usuário
[Jornadas principais]

## 8. Critérios de Aceite
[Como validar cada funcionalidade]

Seja MUITO específico, detalhado e técnico. Forneça exemplos de código se necessário.`

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Você é um expert em Product Management e documentação técnica. Crie PRDs extremamente detalhados e acionáveis para IAs.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4000
        })

        return response.choices[0]?.message?.content || '# Erro ao gerar PRD'
    } catch (error) {
        console.error('Groq PRD error:', error)
        return '# Erro de conexão ao gerar PRD'
    }
}
