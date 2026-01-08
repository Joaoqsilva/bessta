# Mapa Mental de Navegação do Site

Este documento descreve a estrutura de navegação e as rotas disponíveis na aplicação.

## 🌐 Acesso Público (Visitantes)

### **Portal Principal (SaaS)**
*   **`_ROOT_ /`** (Landing Page Principal)
    *   Apresentação do software
    *   Recursos e Preços
    *   Link para Login/Registro
*   **`/login`**
    *   Login para donos de lojas (Store Owners)
    *   Login para administradores (Master Admins)
*   **`/register`**
    *   Registro de novos donos de lojas

### **Páginas das Lojas (Clientes Finais)**
*   **`/store/:slug`** (Página de Agendamento Pública)
    *   **Layouts Dinâmicos** (configurados pelo dono via `/app/editor`):
        *   *Default (Moderno)*
        *   *Barbearia (`barber-shop`)*
        *   *Psicologia (`psychology-office`)*
        *   *Psicologia Mindful (`psychology-mindful`)*
        *   *Clínica de Terapia (`health-clinic`)*
        *   *Psicologia Equilíbrio (`psychology-equilibrio`)*
        *   *Moderno (`modern`)* - **Novo**
        *   *Simples (`simple`)* - **Novo**
        *   *Salão de Beleza (`beauty-salon`)* - **Novo**
    *   **Fluxo de Agendamento**:
        1.  Seleção de Serviço
        2.  Seleção de Profissional (opcional)
        3.  Seleção de Data/Hora
        4.  Identificação do Cliente (Login/Registro via Modal)
        5.  Confirmação

---

## 🏢 Área do Dono da Loja (Store Admin)
*Requer autenticação como Store Owner*

### **Painel Administrativo (`/app`)**
*   **`/app`** (Dashboard Principal)
    *   Resumo de agendamentos hoje/semana
    *   Métricas rápidas (Faturamento, Clientes)
*   **`/app/calendar`** (ou `/app/appointments`)
    *   Agenda Interativa (Visualização Diária/Semanal)
    *   Gerenciar Agendamentos (Criar, Editar, Cancelar)
*   **`/app/services`**
    *   Cadastro de Serviços
    *   Definição de Preços e Durações
*   **`/app/customers`**
    *   Lista de Clientes
    *   Histórico de Agendamentos
*   **`/app/settings`**
    *   Configurações da Loja
    *   Horários de Funcionamento
    *   Link para o Editor Visual

### **Editor Visual (`/app/editor`)**
*   **Ferrementa Standalone** para customizar a `/store/:slug`
*   **Funcionalidades**:
    *   Escolha de Layout/Template
    *   Edição de Cores e Fontes
    *   Upload de Imagens (Logo, Capa)
    *   **Edição de Texto e Ícones** (Clique para editar)
    *   Preview Mobile/Desktop

---

## 👑 Área Master (Super Admin)
*Requer autenticação como Master Admin*

### **Painel Master (`/admin/master`)**
*   **`/admin/master`** (Dashboard Geral)
    *   Métricas Globais da Plataforma
    *   Monitoramento de Lojas
*   **`/admin/master/stores`**
    *   Gerenciar Lojas Cadastradas
*   **`/admin/master/complaints`**
    *   Gerenciar Reclamações
*   **`/admin/master/support`**
    *   Tickets de Suporte
*   **`/admin/master/settings`**
    *   Configurações da Plataforma SaaS

---

## 🧪 Rotas de Desenvolvimento/Teste
*Páginas estáticas para visualização direta de componentes*

*   `/new-landing` (Teste de nova LP SaaS)
*   `/landing-psychology` (Teste direto do componente Psicologia)
*   `/landing-barber` (Teste direto do componente Barbearia)
*   `/landing-therapy` (Teste direto do componente Terapia)
