ROADMAP SUGERIDO — TEM HORÁRIO?

FASE 1 — ONBOARDING DO ESTABELECIMENTO
Prioridade: muito alta

[ ] Criar página pública de cadastro do estabelecimento
[ ] Cadastrar nome, telefone, endereço e senha
[ ] Fazer login automático após o cadastro
[ ] Criar assistente inicial em etapas:
    1. Dados do estabelecimento
    2. Horário de funcionamento
    3. Primeiro serviço
    4. Primeiro colaborador
    5. Agenda inicial do colaborador
    6. Revisão e conclusão
[ ] Mostrar checklist de configuração no dashboard
[ ] Impedir publicação para clientes enquanto não houver:
    - pelo menos um serviço
    - pelo menos um colaborador
    - um serviço atribuído ao colaborador
    - uma agenda configurada
[ ] Criar campo/status de onboarding concluído

Objetivo:
Permitir que uma barbearia conheça o sistema, cadastre-se e fique
pronta para receber agendamentos sem intervenção manual.


FASE 2 — UPLOAD REAL DE FOTOS
Prioridade: alta

[ ] Upload da foto do estabelecimento
[ ] Upload da foto do colaborador
[ ] Upload da foto do cliente, opcional
[ ] Validar formato e tamanho no backend
[ ] Gerar nomes únicos para os arquivos
[ ] Salvar somente a URL no banco
[ ] Definir imagem padrão quando não houver foto
[ ] Remover ou substituir fotos antigas

Infraestrutura sugerida:
- Desenvolvimento: armazenamento local
- Produção: Cloudflare R2, Amazon S3 ou serviço compatível com S3

Evitar:
- Salvar base64 no banco
- Salvar arquivos diretamente dentro do repositório
- Aceitar qualquer tipo/tamanho de arquivo


FASE 3 — NOTIFICAÇÕES DENTRO DO SISTEMA
Prioridade: alta

[ ] Criar entidade Notification
[ ] Relacionar notificação com:
    - estabelecimento
    - colaborador
    - cliente
[ ] Criar tipos de notificação:
    - novo agendamento
    - agendamento confirmado
    - agendamento recusado
    - agendamento cancelado
    - atendimento próximo
[ ] Criar endpoint para listar notificações
[ ] Criar endpoint para marcar como lida
[ ] Criar endpoint para marcar todas como lidas
[ ] Adicionar sino no cabeçalho
[ ] Mostrar contador de não lidas
[ ] Criar central de notificações

Primeira implementação:
- Salvar as notificações no banco
- Frontend consultar periodicamente, por exemplo a cada 30 segundos

Evolução posterior:
- Server-Sent Events ou WebSocket
- Push notification
- E-mail
- WhatsApp


FASE 4 — EVENTOS DE AGENDAMENTO
Prioridade: alta

[ ] Separar a criação do agendamento da criação de notificações
[ ] Emitir evento "appointment.created"
[ ] Notificar o colaborador escolhido
[ ] Notificar o estabelecimento
[ ] Ao confirmar, notificar o cliente
[ ] Ao cancelar, notificar as partes envolvidas
[ ] Preparar fila para processamento assíncrono

Estrutura sugerida:
AppointmentService
    -> cria o agendamento
    -> emite evento

NotificationService
    -> recebe o evento
    -> cria notificações internas

No futuro:
Queue/worker
    -> envia push, e-mail ou WhatsApp


FASE 5 — LANDING PAGE
Prioridade: média/alta

[ ] Criar landing institucional
[ ] Explicar o problema resolvido
[ ] Mostrar benefícios para estabelecimentos
[ ] Mostrar como funciona
[ ] Exibir telas ou demonstração
[ ] Adicionar chamada "Cadastre seu estabelecimento"
[ ] Adicionar chamada "Encontrar um horário"
[ ] Criar seção de perguntas frequentes
[ ] Criar páginas de termos e privacidade

Organização sugerida:
"/"              -> landing page
"/explorar"      -> catálogo para clientes
"/cadastro"      -> cadastro de cliente
"/para-negocios" -> cadastro/onboarding de estabelecimento
"/painel"        -> dashboard administrativo

A landing vende o produto.
A página de explorar entrega o produto ao cliente.


FASE 6 — LOGIN COM GOOGLE
Prioridade: média

[ ] Configurar Google Identity Services
[ ] Receber o ID token no frontend
[ ] Enviar o ID token ao backend
[ ] Backend verificar assinatura, emissor e audience
[ ] Localizar usuário pelo google_sub
[ ] Vincular com conta existente quando apropriado
[ ] Criar conta quando ainda não existir
[ ] Emitir o JWT próprio do Tem Horário
[ ] Criar etapa para completar telefone e outros dados obrigatórios

Campos novos sugeridos:
- email
- google_sub
- auth_provider
- email_verified

Começaria com:
- Login Google para clientes

Depois:
- Login Google para responsáveis por estabelecimentos

Não começaria com:
- Login Google para colaboradores

O colaborador normalmente nasce de um convite ou cadastro feito pelo
estabelecimento, então o vínculo com a empresa precisa estar resolvido antes.


FASE 7 — PUSH NOTIFICATIONS
Prioridade: média/futura

[ ] Transformar o frontend em PWA
[ ] Registrar service worker
[ ] Pedir permissão no momento apropriado
[ ] Salvar uma inscrição por dispositivo
[ ] Criar endpoint de inscrição e remoção
[ ] Enviar push ao receber novos agendamentos
[ ] Abrir o agendamento correto ao clicar na notificação
[ ] Tratar múltiplos dispositivos por usuário
[ ] Remover inscrições expiradas

Opções:
- Firebase Cloud Messaging
- Web Push direto com VAPID

Começaria por Firebase Cloud Messaging para reduzir trabalho operacional.


FASE 8 — LEMBRETES AUTOMÁTICOS
Prioridade: futura

[ ] Lembrete ao cliente 24 horas antes
[ ] Lembrete ao cliente 2 horas antes
[ ] Lembrete ao colaborador no início do dia
[ ] Configuração para ativar/desativar lembretes
[ ] Job agendado no backend
[ ] Controle para não enviar o mesmo lembrete duas vezes

Canais futuros:
- Notificação interna
- Push
- E-mail
- WhatsApp


FASE 9 — FUNDAÇÃO PARA PRODUÇÃO
Prioridade: contínua

[ ] Substituir synchronize por migrations do TypeORM
[ ] Adicionar índices únicos para telefones e google_sub
[ ] Padronizar tratamento de erros
[ ] Adicionar logs estruturados
[ ] Criar testes do fluxo completo de agendamento
[ ] Criar política de backup
[ ] Configurar recuperação de senha
[ ] Avaliar access token + refresh token
[ ] Revisar armazenamento de JWT no frontend
[ ] Criar política de privacidade e consentimento
[ ] Monitorar falhas de notificações