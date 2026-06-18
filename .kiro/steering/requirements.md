# ObraVisão Beta 0.1 — Requirements

## Objetivo

Construir uma primeira versão funcional e enxuta do ObraVisão para liberar acesso a usuários beta interessados.

O sistema deve permitir controlar obras, etapas, despesas, fotos e previsto x realizado.

## Arquitetura da versão

Nesta versão, não criar backend NestJS.

Usar Supabase como backend principal:

- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Supabase Storage
- Edge Functions apenas se realmente necessário

## Premissas

- O sistema deve ser multi-tenant
- Cada organização deve ver apenas seus próprios dados
- O sistema deve funcionar bem em celular
- Todos os textos da interface devem estar em português
- O foco é velocidade de entrega e usabilidade
- Não criar funcionalidades fora do escopo

## Usuário beta

Perfil:

- dono de pequena construtora
- empresa de reforma
- engenheiro
- arquiteto
- responsável por obras

Necessidades:

- cadastrar obras
- acompanhar prazos
- lançar despesas
- ver gasto previsto x realizado
- registrar fotos
- acompanhar etapas
- visualizar situação geral no dashboard

## Requisitos funcionais

### RF01 — Autenticação

O usuário deve conseguir:

- criar conta
- fazer login
- fazer logout
- acessar apenas área autenticada

Usar Supabase Auth.

### RF02 — Criação automática de organization + profile (trigger)

Ao criar uma conta no Supabase Auth, o sistema deve criar automaticamente:

- uma organization
- um profile vinculado ao usuário e à organization

Implementação:

- Usar trigger no Supabase em `auth.users` (after insert)
- A trigger deve ler `raw_user_meta_data` para obter:
  - name (nome do usuário)
  - company_name (nome da empresa/organização)
- Criar a organization com o company_name
- Criar o profile com o name, user_id e organization_id

O cadastro no frontend deve enviar esses metadados via `signUp`:

```typescript
supabase.auth.signUp({
  email,
  password,
  options: {
    data: { name, company_name }
  }
})
```

Regra:
O usuário não deve acessar a área interna sem profile e organization vinculados.

### RF03 — Obras

O usuário deve conseguir:

- criar obra
- listar obras
- editar obra
- visualizar detalhe da obra
- alterar status da obra

Campos da obra:

- nome
- cliente
- endereço
- data de início
- data de previsão de entrega
- orçamento previsto
- status

Status:

- planejada
- em andamento
- pausada
- concluída

### RF04 — Etapas

O usuário deve conseguir:

- criar etapa dentro de uma obra
- listar etapas da obra
- editar etapa
- alterar status
- alterar percentual

Campos da etapa:

- nome
- status
- data prevista
- percentual
- observação

Status:

- não iniciada
- em andamento
- concluída
- atrasada

### RF05 — Despesas

O usuário deve conseguir:

- lançar despesa
- listar despesas por obra
- editar despesa
- excluir despesa, se necessário

Campos da despesa:

- obra
- etapa opcional
- categoria
- descrição
- valor
- data
- comprovante opcional

Categorias:

- material
- mão de obra
- terceiros
- frete
- equipamento
- imprevisto
- outro

### RF06 — Fotos e atualizações (work_updates)

O usuário deve conseguir:

- adicionar foto em uma obra
- adicionar descrição/observação
- associar a uma etapa, se necessário
- visualizar histórico de atualizações

Tabela: `work_updates`

Campos:

- id
- organization_id
- work_id
- stage_id (opcional)
- description
- photo_url (opcional)
- created_at

Usar Supabase Storage para fotos.

### RF07 — Dashboard

O dashboard deve mostrar:

- obras em andamento
- obras atrasadas
- obras acima do previsto
- despesas do mês
- última atualização
- lista de obras com progresso
- previsto x realizado por obra
- etapas paradas
- fotos recentes
- despesas recentes

Usar view `dashboard_work_summary` para consultas de performance.

### RF08 — Previsto x realizado

O sistema deve calcular:

- orçamento previsto da obra
- total de despesas lançadas
- diferença entre previsto e realizado
- indicador visual quando gasto passar do previsto

### RF09 — Mobile first

Todas as telas devem funcionar bem no celular.

No mobile:

- tabelas viram cards
- menu deve ser fácil de acessar
- botões principais devem ser grandes
- formulários devem ser simples

## Storage

### Bucket inicial

- `obra-fotos`

### Bucket opcional

- `comprovantes`

### Padrão de path

    organization_id/work_id/file-name

### Policies de storage

As policies devem validar que o usuário autenticado pertence à organization_id presente no path.

Não permitir acesso a arquivos de outra organização.

Não usar service role no frontend.

## Views no Postgres

### dashboard_work_summary

View simples para apoiar o dashboard.

Deve fornecer por obra:

- total gasto (soma de despesas)
- orçamento previsto
- diferença previsto x realizado
- percentual de progresso (média das etapas)
- status da obra
- flag de obra acima do previsto

Não criar BI ou relatórios avançados.
Views simples para performance são permitidas.

## Requisitos não funcionais

### RNF01 — Segurança

- usuário só acessa dados da própria organização
- RLS deve estar habilitado nas tabelas principais
- policies devem validar organization_id
- policies de storage devem validar organization_id no path
- não expor secrets no frontend
- não usar service role no frontend

### RNF02 — Performance

- telas devem carregar rápido
- evitar delays artificiais
- evitar requests desnecessários
- usar estados de loading leves
- TanStack Query para cache e refetch

### RNF03 — Simplicidade

- não criar funcionalidades fora do escopo
- não criar ERP completo
- não criar financeiro detalhado
- não criar controle completo de equipe
- não criar relatórios avançados

### RNF04 — Idioma

- interface 100% em português
- mensagens de erro e sucesso em português
- validações Zod com mensagens em português

## Critério de aceite do Beta 0.1

O beta estará pronto quando um usuário conseguir:

1. criar conta (com organization + profile criados automaticamente)
2. acessar o sistema
3. cadastrar uma obra
4. cadastrar etapas da obra
5. lançar despesas
6. adicionar fotos/atualizações
7. ver dashboard com status, despesas e previsto x realizado
8. acessar apenas dados da própria organização

## Fora do escopo do Beta 0.1

Não implementar:

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
