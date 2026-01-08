# 🌐 Sistema de Domínios Personalizados - Bessta

## Visão Geral

Este sistema implementa uma solução híbrida para domínios de lojas:

- **Gratuito**: `bessta.app/store/nome-da-loja`
- **Premium**: `suaempresa.com` (domínio próprio)

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SettingsPage.tsx                                    │   │
│  │  - Aba "Domínio" com UI completa                    │   │
│  │  - Formulário de domínio personalizado              │   │
│  │  - Instruções de DNS                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  services/domainApi.ts                              │   │
│  │  - addCustomDomain()                                │   │
│  │  - verifyDomainDNS()                                │   │
│  │  - deleteCustomDomain()                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                          BACKEND                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  routes/domains.ts                                  │   │
│  │  - POST /api/domains         (adicionar)            │   │
│  │  - GET  /api/domains/store/:id (buscar)             │   │
│  │  - POST /api/domains/:id/verify (verificar DNS)     │   │
│  │  - DELETE /api/domains/:id   (remover)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  services/domainService.ts                          │   │
│  │  - Gerenciamento de domínios em memória             │   │
│  │  - Verificação real de DNS (CNAME)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                            │                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  services/vercelService.ts                          │   │
│  │  - Integração com Vercel API                        │   │
│  │  - Adicionar/remover domínios automaticamente       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Instalação

### Backend (Servidor)

```bash
cd server
npm install
cp .env.example .env
# Configure as variáveis de ambiente
npm run dev
```

### Frontend (Cliente)

```bash
cd client
npm install
npm run dev
```

## Configuração

### Variáveis de Ambiente (server/.env)

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Vercel API (obrigatório para auto-configuração)
VERCEL_TOKEN=seu_token_aqui
VERCEL_PROJECT_ID=seu_project_id_aqui
VERCEL_TEAM_ID=seu_team_id_aqui  # opcional
```

### Obtendo Credenciais Vercel

1. **VERCEL_TOKEN**: 
   - Acesse https://vercel.com/account/tokens
   - Clique em "Create Token"
   - Dê um nome e clique em "Create"

2. **VERCEL_PROJECT_ID**:
   - Vá em https://vercel.com/[seu-usuario]/[seu-projeto]/settings
   - Procure por "Project ID"

3. **VERCEL_TEAM_ID** (se usar time):
   - Vá em https://vercel.com/[seu-time]/~/settings
   - Procure por "Team ID"

## Fluxo do Usuário

### 1. Usuário Adiciona Domínio

1. Acessa Configurações → Domínio
2. Digita o domínio (ex: `clinicapsi.com`)
3. Clica em "Salvar Domínio"
4. Sistema:
   - Valida formato
   - Salva no banco de dados
   - Adiciona ao Vercel (se configurado)
   - Retorna instruções de DNS

### 2. Usuário Configura DNS

O usuário vai ao registrador de domínio e adiciona:

```
Tipo:  CNAME
Nome:  @ (ou deixar vazio)
Valor: cname.vercel-dns.com
```

### 3. Verificação de DNS

1. Usuário clica em "Verificar DNS"
2. Backend faz lookup CNAME real
3. Se CNAME aponta para Vercel → ✅ Verificado
4. SSL é provisionado automaticamente pelo Vercel

## API Endpoints

### POST /api/domains
Adiciona um novo domínio.

```json
// Request
{
  "storeId": "store-123",
  "domain": "clinicapsi.com"
}

// Response
{
  "success": true,
  "domain": {
    "id": "dom-456",
    "storeId": "store-123",
    "domain": "clinicapsi.com",
    "verified": false,
    "dnsStatus": "pending"
  },
  "dnsInstructions": {
    "type": "CNAME",
    "name": "@",
    "value": "cname.vercel-dns.com"
  }
}
```

### POST /api/domains/:id/verify
Verifica configuração DNS.

```json
// Response (sucesso)
{
  "success": true,
  "verified": true,
  "message": "DNS configurado corretamente!",
  "cnames": ["cname.vercel-dns.com"]
}

// Response (erro)
{
  "success": false,
  "verified": false,
  "message": "CNAME não encontrado. Configure o DNS."
}
```

### GET /api/domains/lookup/:domain
Busca loja pelo domínio (para roteamento).

```json
// Response
{
  "success": true,
  "storeId": "store-123",
  "domain": "clinicapsi.com",
  "verified": true
}
```

## Roteamento de Domínios Personalizados

### Opção 1: Vercel Rewrite Rules (Recomendado)

Configure no painel do Vercel ou via `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "clinicapsi.com" }],
      "destination": "/store/clinica-psi-123/$1"
    }
  ]
}
```

### Opção 2: Edge Middleware (Next.js)

Para projetos Next.js, use middleware para roteamento dinâmico.

### Opção 3: Cloudflare Workers

Para maior controle, use Cloudflare Workers para roteamento edge.

## Segurança

- ✅ Validação de formato de domínio
- ✅ Verificação real de DNS antes de ativar
- ✅ Rate limiting em endpoints de verificação
- ✅ CORS configurado corretamente
- ⚠️ (Futuro) Adicionar autenticação JWT nos endpoints

## Próximos Passos

1. [ ] Migrar armazenamento para banco de dados (PostgreSQL/MongoDB)
2. [ ] Adicionar autenticação JWT
3. [ ] Implementar webhook para notificar SSL ativo
4. [ ] Dashboard admin para gerenciar todos os domínios
5. [ ] Rate limiting por IP
6. [ ] Monitoramento de expiração de DNS

## Troubleshooting

### "CNAME não encontrado"
- Propagação DNS pode levar até 48h
- Verifique se o registro está correto no registrador

### "Domínio já em uso"
- O domínio já está configurado em outro projeto Vercel
- Remova do projeto anterior primeiro

### "Erro de verificação"
- Verifique se o servidor backend está rodando
- Verifique logs do servidor
