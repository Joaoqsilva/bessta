# 🚀 Guia de Deploy - Bessta API

## Opção 1: Railway (Recomendado)

Railway é a opção mais fácil para Node.js + MongoDB.

### Passo a Passo

1. **Criar conta no Railway**
   - Acesse [railway.app](https://railway.app)
   - Faça login com GitHub

2. **Criar projeto**
   ```
   1. Clique em "New Project"
   2. Selecione "Deploy from GitHub repo"
   3. Escolha seu repositório bessta
   4. Selecione a pasta `server`
   ```

3. **Adicionar MongoDB**
   ```
   1. Clique em "New"
   2. Selecione "Database" → "MongoDB"
   3. O Railway criará uma instância MongoDB automaticamente
   ```

4. **Configurar variáveis de ambiente**
   No painel do Railway, adicione:
   ```env
   MONGODB_URI=${{MongoDB.MONGO_URL}}
   JWT_SECRET=seu-secret-super-seguro-aqui
   CORS_ORIGIN=https://bessta-murex.vercel.app,https://seu-dominio.com
   NODE_ENV=production
   ```

5. **Deploy automático**
   - O Railway faz deploy automático a cada push
   - Acesse a URL gerada (ex: `bessta-api.up.railway.app`)

### Custos Railway
- **Trial**: $5 grátis
- **Hobby**: $5/mês + uso
- **Pro**: $20/mês

---

## Opção 2: Render

### Passo a Passo

1. **Criar conta no Render**
   - Acesse [render.com](https://render.com)
   - Faça login com GitHub

2. **Criar Web Service**
   ```
   1. New → Web Service
   2. Conecte seu repositório
   3. Configure:
      - Name: bessta-api
      - Root Directory: server
      - Environment: Node
      - Build Command: npm install && npm run build
      - Start Command: npm start
   ```

3. **Adicionar MongoDB Atlas** (grátis)
   - Crie uma conta em [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Crie um cluster M0 (grátis para sempre)
   - Copie a connection string

4. **Variáveis de ambiente**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.xxx.mongodb.net/bessta
   JWT_SECRET=seu-secret-aqui
   CORS_ORIGIN=https://bessta-murex.vercel.app
   NODE_ENV=production
   ```

### Custos Render
- **Free**: 750 horas/mês, spin down após 15min inativo
- **Starter**: $7/mês, sempre online

---

## Opção 3: Vercel Serverless

Para Vercel, precisamos adaptar para serverless functions.

### Estrutura necessária
```
server/
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   └── me.ts
│   ├── domains/
│   │   └── [...path].ts
│   └── health.ts
├── vercel.json
└── package.json
```

> **Nota**: Vercel é melhor para frontend. Para backend com MongoDB, Railway ou Render são mais simples.

---

## Configuração MongoDB Atlas (Gratuito)

1. **Criar conta**: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

2. **Criar cluster**:
   - Selecione M0 (Free Forever)
   - Escolha região próxima
   - Clique "Create"

3. **Configurar acesso**:
   - Database Access → Add User
   - Network Access → Allow from Anywhere (0.0.0.0/0)

4. **Obter connection string**:
   - Clusters → Connect → Drivers
   - Copie: `mongodb+srv://user:pass@cluster.xxx.mongodb.net/bessta`

---

## Variáveis de Ambiente de Produção

```env
# Obrigatórias
MONGODB_URI=mongodb+srv://...
JWT_SECRET=sua-chave-super-segura-aqui
CORS_ORIGIN=https://seu-frontend.com

# Opcionais
NODE_ENV=production
PORT=3001

# Vercel API (se usar)
VERCEL_TOKEN=...
VERCEL_PROJECT_ID=...
```

### Gerar JWT_SECRET seguro
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Atualizar Frontend

Após deploy do backend, atualize o frontend para usar a nova URL:

1. **Criar `.env` no cliente**:
   ```env
   VITE_API_URL=https://sua-api.railway.app
   ```

2. **Ou atualizar `domainApi.ts`**:
   ```typescript
   const API_BASE = import.meta.env.VITE_API_URL || 'https://sua-api.railway.app';
   ```

3. **Redeploy no Vercel**

---

## Verificar Deploy

```bash
# Health check
curl https://sua-api.railway.app/health

# Deve retornar:
# {"status":"ok","timestamp":"...","version":"1.0.0"}
```

---

## Troubleshooting

### "Connection refused"
- Verifique MONGODB_URI
- Verifique Network Access no Atlas (permitir 0.0.0.0/0)

### "Invalid token"
- JWT_SECRET deve ser o mesmo no backend e frontend
- Token pode ter expirado

### "CORS error"
- Adicione a URL do frontend em CORS_ORIGIN
- Separe múltiplas URLs com vírgula
