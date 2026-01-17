# Checklist de Configuração de E-mail (Produção)

Se os e-mails não estão chegando em produção, verifique os seguintes pontos:

## 1. Variáveis de Ambiente no Servidor
As variáveis definidas no seu `.env` local **não** são enviadas para produção. Você precisa configurá-las manualmente no painel do seu provedor (Vercel, Render, Railway, AWS, etc.).

Certifique-se de que estas variáveis estão definidas corretamente:

- `SMTP_HOST`: `smtp.gmail.com` (se usar Gmail)
- `SMTP_PORT`: `587` (STARTTLS) ou `465` (SSL)
- `SMTP_SECURE`: `false` (se porta 587) ou `true` (se porta 465)
- `SMTP_USER`: Seu endereço de email completo (ex: `contato@simpliagenda.com`)
- `SMTP_PASS`: **NÃO** use sua senha de login normal se for Gmail. Use uma **Senha de App**.
- `SMTP_FROM_NAME`: `Simpliagenda`

## 2. Senha de App (Gmail)
Se você usa Gmail, o Google bloqueia login com senha normal por segurança.
1. Acesse sua Conta Google > Segurança.
2. Ative "Verificação em duas etapas" (se não estiver ativada).
3. Busque por "Senhas de App".
4. Crie uma nova senha (nome: "Simpliagenda Server").
5. Copie a senha de 16 caracteres gerada e use-a na variável `SMTP_PASS`.

## 3. Logs de Erro
O sistema foi atualizado para registrar falhas no envio de e-mail no **Log de Auditoria** do sistema.
- Acesse o painel de Admin Master.
- Verifique se há logs do tipo `PASSWORD_RESET_EMAIL_FAILED`.
- Se houver, significa que o sistema tentou enviar, mas o provedor de e-mail rejeitou (provavelmente autenticação).

## 4. Teste de Conexão
Se o problema persistir:
- Verifique se o seu servidor bloqueia portas de saída (alguns VPS bloqueiam porta 25/587 por padrão para evitar spam).
- Tente usar a porta 465 com `SMTP_SECURE=true`.
