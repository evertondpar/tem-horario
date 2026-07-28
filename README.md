# Tem Horário? 💈

Sistema de agendamento online para barbearias desenvolvido com NestJS.

O objetivo do projeto é permitir que uma barbearia gerencie colaboradores, serviços, agendas e agendamentos através de uma API REST, além de disponibilizar um ambiente público para que clientes possam realizar agendamentos.

> Projeto desenvolvido para fins de estudo, portfólio e aplicação prática de conceitos de arquitetura backend.

---

## 🚀 Tecnologias

- NestJS
- TypeScript
- TypeORM
- MySQL
- JWT Authentication
- Class Validator
- Day.js
- Bcrypt

---

## 📁 Estrutura

```text
src/
├── appointments/
├── auth/
├── collaborator-service/
├── collaborators/
├── establishments/
├── schedules/
├── services/
└── common/
```

---

## 🔐 Autenticação

O sistema possui autenticação JWT.

Existem dois tipos de acesso:

- Administrador da barbearia
- Colaborador

Cada tipo possui permissões específicas.

---

## 💈 Funcionalidades

### Administração

- Login
- Cadastro de colaboradores
- Cadastro de serviços
- Vincular serviços aos colaboradores
- Configuração da agenda dos colaboradores
- Gerenciamento de agendamentos
- Confirmação
- Cancelamento
- Recusa
- Conclusão de agendamentos

### Público

- Listar colaboradores
- Listar serviços
- Consultar horários disponíveis
- Criar agendamento

---

## 📅 Funcionamento da agenda

Cada colaborador possui uma agenda própria.

A agenda é composta por 48 slots de 30 minutos.

Exemplo:

08:00 → Disponível

08:30 → Disponível

09:00 → Ocupado

09:30 → Ocupado

...

Os estados possíveis são:

| Status | Valor |
|--------|------:|
| AVAILABLE | 0 |
| OCCUPIED | 1 |
| UNAVAILABLE | 2 |

---

## ⚙️ Regras de negócio

- Um colaborador só pode realizar serviços que estejam vinculados a ele.
- Não é possível agendar horários indisponíveis.
- Todos os horários necessários para a duração do serviço devem estar livres.
- A agenda é atualizada automaticamente após um agendamento.
- Alterações que envolvem múltiplas tabelas são realizadas utilizando transações do TypeORM.

---

## 📚 Endpoints

### Auth

POST /auth/login

---

### Collaborators

GET /admin/collaborators

POST /admin/collaborators

PATCH /admin/collaborators/:id

DELETE /admin/collaborators/:id

---

### Services

GET /admin/services

POST /admin/services

PATCH /admin/services/:id

DELETE /admin/services/:id

---

### Appointments

GET /admin/appointments

POST /public/appointments

PATCH /admin/appointments/:id/status

---

## 🗄️ Banco de dados

O projeto utiliza MySQL e TypeORM.

Principais entidades:

- Establishment
- Collaborator
- Service
- CollaboratorService
- Schedule
- Appointment

---

## ▶️ Executando

Clone o projeto

```bash
git clone ...
```

Instale as dependências

```bash
npm install
```

Configure o arquivo `.env`

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

JWT_SECRET=
```

Execute

```bash
npm run start:dev
```

---

## 📌 Próximas melhorias

- Cadastro de clientes
- Notificações
- Upload de imagens
- Recuperação de senha
- Dashboard
- Testes automatizados
- Docker
- Deploy

---

## 👨‍💻 Autor

Everton Ribeiro

Desenvolvido para fins de aprendizado e portfólio.
