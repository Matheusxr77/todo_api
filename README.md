# Todo API

API para cadastro de usuários, autenticação e gerenciamento de tarefas.

## Requisitos

- Node.js
- npm

## Dependências

Instale as dependências abaixo com `npm install`:

- express
- cors
- dotenv
- sqlite3
- bcryptjs
- jsonwebtoken
- swagger-jsdoc
- swagger-ui-express
- supertest (para testes)
- jest (para testes)

## Instalação

```bash
npm install
```

## Execução

```bash
npm start
```

## Ambiente de desenvolvimento

```bash
npm run dev
```

## Testes

```bash
npm test
```

## Rotas

- `POST /api/auth/register` — Cadastro de usuário
- `POST /api/auth/login` — Login e obtenção de token JWT
- `POST /api/auth/logout` — Logout do usuário (descarta o token no cliente)
- `POST /api/tasks` — Criação de tarefa (autenticado)
- `GET /api/tasks` — Listagem de tarefas pendentes (autenticado)
- `PUT /api/tasks/:id` — Editar tarefa (autenticado)
- `DELETE /api/tasks/:id` — Excluir tarefa (autenticado)

## Documentação Swagger

Acesse `/api-docs` após iniciar o servidor.