# ObraVisão Beta 0.1 — Tasks

## Fase 1 — Base do projeto

- [ ] Inicializar projeto React + Vite + TypeScript
- [ ] Instalar Tailwind CSS
- [ ] Instalar dependências: TanStack Query, React Hook Form, Zod, Lucide React, @supabase/supabase-js, react-router-dom
- [ ] Configurar variáveis de ambiente do Supabase (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Criar cliente Supabase em src/lib/supabase.ts
- [ ] Configurar QueryClientProvider (TanStack Query)
- [ ] Configurar padrão visual base conforme protótipo
- [ ] Garantir sistema em português

## Fase 2 — Supabase schema

- [ ] Criar tabela organizations (id, name, created_at)
- [ ] Criar tabela profiles (id, user_id, organization_id, name, created_at)
- [ ] Criar tabela works (id, organization_id, nome, cliente, endereço, data_inicio, data_previsao, orcamento_previsto, status, created_at, updated_at)
- [ ] Criar tabela stages (id, organization_id, work_id, nome, status, data_prevista, percentual, observacao, created_at, updated_at)
- [ ] Criar tabela expenses (id, organization_id, work_id, stage_id opcional, categoria, descricao, valor, data, comprovante_url opcional, created_at)
- [ ] Criar tabela work_updates (id, organization_id, work_id, stage_id opcional, description, photo_url opcional, created_at)
- [ ] Garantir organization_id em todas as tabelas principais
- [ ] Criar índices por organization_id e work_id
- [ ] Criar trigger de updated_at em works e stages
- [ ] Criar view dashboard_work_summary

## Fase 3 — Trigger de signup

- [ ] Criar trigger em auth.users (after insert)
- [ ] A trigger deve ler raw_user_meta_data (name, company_name)
- [ ] Criar organization com company_name
- [ ] Criar profile com name, user_id e organization_id
- [ ] Testar que signup cria organization + profile automaticamente

## Fase 4 — RLS e segurança

- [ ] Habilitar RLS nas tabelas principais
- [ ] Criar policies para organizations (usuário só vê a própria)
- [ ] Criar policies para profiles (usuário só vê o próprio)
- [ ] Criar policies para works (filtrar por organization_id)
- [ ] Criar policies para stages (filtrar por organization_id)
- [ ] Criar policies para expenses (filtrar por organization_id)
- [ ] Criar policies para work_updates (filtrar por organization_id)
- [ ] Garantir que usuário só veja dados da própria organização
- [ ] Testar isolamento com dois usuários/organizações

## Fase 5 — Storage

- [ ] Criar bucket obra-fotos
- [ ] Criar policies de storage validando organization_id no path
- [ ] Definir padrão de path: organization_id/work_id/file-name
- [ ] Criar helper de upload no frontend
- [ ] Testar que usuário não acessa arquivos de outra organização

## Fase 6 — Autenticação (frontend)

- [ ] Criar tela de cadastro com name e company_name
- [ ] Criar tela de login
- [ ] Criar logout
- [ ] Criar proteção de rotas (ProtectedRoute)
- [ ] Criar AuthProvider com sessão do usuário
- [ ] Carregar profile e organization do usuário autenticado
- [ ] Bloquear acesso à área interna sem profile/organization

## Fase 7 — Layout principal

- [ ] Criar layout autenticado
- [ ] Criar sidebar desktop (azul escuro/navy)
- [ ] Criar navegação mobile (drawer ou bottom nav)
- [ ] Criar header com usuário logado
- [ ] Criar estados visuais de loading/erro/vazio
- [ ] Garantir responsividade mobile first

## Fase 8 — Obras

- [ ] Criar hooks com TanStack Query para works (useWorks, useWork, useCreateWork, useUpdateWork)
- [ ] Criar schema Zod para formulário de obra
- [ ] Criar tela de listagem de obras (cards no mobile)
- [ ] Criar formulário de nova obra (React Hook Form + Zod)
- [ ] Criar tela de detalhe da obra
- [ ] Criar formulário de edição de obra
- [ ] Validar que obras são filtradas por organization_id/RLS

## Fase 9 — Etapas

- [ ] Criar hooks com TanStack Query para stages
- [ ] Criar schema Zod para formulário de etapa
- [ ] Criar componente de etapas na tela da obra
- [ ] Criar formulário de nova/editar etapa
- [ ] Permitir alteração de status e percentual
- [ ] Validar que etapas pertencem à obra e organização correta

## Fase 10 — Despesas

- [ ] Criar hooks com TanStack Query para expenses
- [ ] Criar schema Zod para formulário de despesa
- [ ] Criar tela/seção de despesas por obra
- [ ] Criar formulário de lançar/editar despesa
- [ ] Permitir exclusão de despesa
- [ ] Calcular total realizado por obra
- [ ] Validar despesas por organization_id/RLS

## Fase 11 — Fotos e atualizações (work_updates)

- [ ] Criar hooks com TanStack Query para work_updates
- [ ] Criar upload de foto via Supabase Storage
- [ ] Criar formulário de nova atualização (descrição + foto opcional + etapa opcional)
- [ ] Criar listagem de atualizações por obra
- [ ] Garantir que fotos pertencem à organização correta
- [ ] Garantir funcionamento no celular

## Fase 12 — Dashboard

- [ ] Criar hooks para dashboard usando view dashboard_work_summary
- [ ] Mostrar obras em andamento
- [ ] Mostrar obras atrasadas
- [ ] Mostrar obras acima do previsto
- [ ] Mostrar despesas do mês
- [ ] Listar obras com progresso e previsto x realizado
- [ ] Listar etapas paradas
- [ ] Listar despesas recentes
- [ ] Listar fotos/atualizações recentes
- [ ] Criar dashboard responsivo conforme protótipo

## Fase 13 — Ajustes finais

- [ ] Revisar textos em português
- [ ] Revisar responsividade mobile
- [ ] Revisar fluxo completo: cadastro → dashboard
- [ ] Remover delays artificiais
- [ ] Remover código morto
- [ ] Testar criação de uma obra completa com etapas, despesas e fotos
- [ ] Testar isolamento por organização
- [ ] Deploy do beta

## Testes básicos

- [ ] Testar cadastro/login/logout
- [ ] Testar criação automática de organization + profile
- [ ] Testar criação de obra
- [ ] Testar criação de etapa
- [ ] Testar lançamento de despesa
- [ ] Testar upload de foto
- [ ] Testar dashboard com dados reais
- [ ] Testar isolamento por organization/RLS
- [ ] Testar tentativa de acesso a dados de outra organização

Não criar suíte extensa.
Não travar entrega por cobertura de testes.

## Fora do escopo

Não implementar nesta fase:

- NestJS
- financeiro completo
- contas a pagar
- contas a receber
- controle completo de equipe
- folha de pagamento
- orçamento em PDF
- propostas comerciais
- relatórios avançados
- permissões complexas
- app mobile nativo
- integrações
- WhatsApp integrado
- emissão fiscal
- estoque
