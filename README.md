# Hubly - AI-Powered Lead Generation SaaS

![Hubly](https://img.shields.io/badge/Status-MVP-blue)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)

Plataforma moderna de prospecção de leads com IA para o mercado brasileiro. Use buscas do Google + agentes de IA para encontrar leads qualificados em minutos.

## ✨ Funcionalidades

- 🎯 **Busca inteligente de leads** via Serper API
- 🤖 **Qualificação automatizada** com agentes de IA
- 💬 **Mensagens personalizadas** geradas por IA
- 📊 **Dashboard analítico** com métricas em tempo real
- 🎨 **Design premium** com dark mode e glassmorphism
- 🔐 **Autenticação completa** com Supabase (email/senha + magic link)
- 📱 **Totalmente responsivo** e mobile-first

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- Conta no [Supabase](https://supabase.com)
- (Opcional) Chave API do [Serper](https://serper.dev)

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd hublysaas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_publica_do_supabase
VITE_SERPER_API_KEY=sua_chave_do_serper (opcional)
```

4. Configure o banco de dados Supabase:

Execute o script SQL em `supabase/schema.sql` no editor SQL do Supabase. Isso criará:
- Tabelas (profiles, campaigns, leads, subscriptions)
- Políticas RLS para segurança
- Triggers automáticos
- Indexes para performance

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
hublysaas/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── layout/          # Sidebar, Header, DashboardLayout
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx  # Autenticação
│   │   └── ThemeContext.tsx # Dark/Light mode
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── types.ts         # TypeScript types
│   │   └── utils.ts         # Utilitários
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Leads.tsx
│   │   ├── Agents.tsx
│   │   └── Settings.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql           # Database schema
└── package.json
```

## 🎨 Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Context API + Zustand
- **Routing**: React Router Dom v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🔐 Autenticação

O Hubly usa Supabase Auth com suporte para:
- Login com email/senha
- Login com magic link
- Criação automática de perfil no signup
- Row Level Security (RLS) para proteção de dados

## 📊 Modelos de Dados

### Profiles
- Informações estendidas de usuário
- Créditos, plano, role
- API keys (criptografadas)

### Campaigns
- Campanhas de prospecção
- Query, filtros, status
- Linked aos leads

### Leads
- Empresas prospectadas
- Score de qualificação IA
- Status, contatos, notas

### Subscriptions
- Integrações Stripe (futuro)
- Gestão de planos

## 🚧 Roadmap

### ✅ Fase 1 - MVP (Atual)
- [x] Landing page
- [x] Autenticação completa
- [x] Dashboard base
- [x] Design system premium

#### [DONE] Fase 2 - Core Features
- [x] Integração Serper API real
- [x] Sistema de campanhas completo
- [x] Gerenciamento de leads
- [x] Qualificação IA (Groq LLaMA 3)

#### [DONE] Fase 3 - Advanced
- [x] Mensagens personalizadas por IA (Groq)
- [ ] Integração Stripe
- [ ] Exportação CSV/Excel
- [x] Agentes IA customizados (Pronto para Groq)

### 🔮 Fase 4 - Integrations
- [ ] WhatsApp Business API
- [ ] Envio de emails via SMTP
- [ ] Integração LinkedIn
- [ ] Webhooks para CRMs

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting com ESLint
```

## 🎯 Planos e Preços

- **Free**: 50 leads/mês, 5 campanhas
- **Pro**: R$99/mês - Ilimitado
- **Enterprise**: Custom - Recursos avançados

## 📝 Licença

Propriedade privada. Todos os direitos reservados.

## 🤝 Contribuição

Este é um projeto privado no momento.

## 📧 Contato

Para dúvidas ou suporte, entre em contato em: support@hubly.com.br

---

**Construído com ❤️ para o mercado brasileiro**
