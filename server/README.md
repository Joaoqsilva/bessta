# Bessta API Server

Backend API para o sistema de agendamentos Bessta.

## Tecnologias

- **Node.js** + **Express** + **TypeScript**
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **bcrypt** para hash de senhas

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar MongoDB local (se não usar Atlas)
mongod

# Iniciar servidor de desenvolvimento
npm run dev
```

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário + loja |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Perfil do usuário |
| PUT | `/api/auth/profile` | Atualizar perfil |
| PUT | `/api/auth/password` | Alterar senha |

### Domínios

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/domains` | Adicionar domínio |
| GET | `/api/domains/store/:id` | Buscar domínio da loja |
| POST | `/api/domains/:id/verify` | Verificar DNS |
| DELETE | `/api/domains/:id` | Remover domínio |
| GET | `/api/domains/lookup/:domain` | Lookup por domínio |

## Deploy no Railway

1. Crie uma conta em [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Adicione um serviço MongoDB ou use MongoDB Atlas
4. Configure as variáveis de ambiente:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
5. Deploy automático!

## Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.
