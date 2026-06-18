# ObraVisão — Stack e padrões técnicos

## Stack do Beta 0.1

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- TanStack Query (obrigatório)
- React Hook Form (obrigatório)
- Zod (obrigatório)

Backend/Infraestrutura:

- Supabase Auth
- Supabase Postgres
- Supabase Row Level Security
- Supabase Storage
- Supabase Edge Functions apenas se realmente necessário

Não criar backend NestJS nesta fase.

## TanStack Query

Obrigatório desde o início do projeto.

Usar TanStack Query para:

- listagem de obras
- detalhe da obra
- etapas por obra
- despesas por obra
- atualizações/fotos por obra
- dashboard
- mutations de criação, edição e exclusão

Motivo:
Evitar recriar manualmente cache, loading states, mutations, refetch e tratamento de erro em cada service/tela.

Padrão:

- queries com `useQuery` para leitura
- mutations com `useMutation` para escrita
- invalidação de cache após mutations
- loading/error states vindos do TanStack Query

## React Hook Form + Zod

Obrigatório em todos os formulários do sistema.

Usar em:

- formulário de cadastro/login
- formulário de obra
- formulário de etapa
- formulário de despesa
- formulário de atualização/foto

Motivo:
Garantir validação simples, mensagens claras em português e evitar validações soltas pelo código.

Padrão:

- schema Zod para cada formulário
- mensagens de erro em português no schema
- `useForm` com `zodResolver`
- campos controlados via `register`

## Decisão arquitetural

No Beta 0.1, o Supabase será usado como backend principal.

Motivo:

- velocidade de entrega
- leads já demonstraram interesse
- produto inicial é CRUD + dashboard
- reduzir complexidade operacional
- colocar usuários beta usando rapidamente

NestJS poderá ser introduzido em uma fase futura, quando houver necessidade real de:

- regras de negócio complexas
- permissões avançadas
- financeiro detalhado
- integrações externas
- webhooks
- processamento assíncrono
- APIs públicas
- auditoria avançada
- app mobile consumindo backend próprio

## Regras gerais

- Código simples e direto
- Evitar abstrações prematuras
- Evitar arquitetura complexa
- Não implementar funcionalidades fora do escopo sem aprovação
- Não criar documentação excessiva
- Não criar testes complexos agora

## Testes

Criar apenas testes básicos e essenciais.

Testar no mínimo:

- cadastro/login/logout
- criação de organization + profile via trigger
- criação de obra
- criação de etapa
- lançamento de despesa
- upload de foto
- dashboard com dados reais
- isolamento por organization/RLS
- tentativa de acesso a dados de outra organização

Não criar suíte extensa neste momento.
Não travar entrega por cobertura de testes.

## Supabase

Usar:

- Supabase Auth para autenticação
- Supabase Postgres como banco principal
- Supabase RLS para isolamento multi-tenant
- Supabase Storage para fotos e comprovantes
- Supabase Client no frontend

Não usar service role no frontend.

Secrets devem ficar apenas em ambiente seguro.

## Multi-tenant e segurança

Regra obrigatória:

Nenhum usuário pode acessar dados de outra organização.

Toda tabela principal deve ter:

- organization_id
- created_at
- updated_at, quando fizer sentido

Toda policy RLS deve garantir que o usuário autenticado só leia/escreva registros da sua organização.

Nunca confiar no organization_id informado manualmente pelo frontend para segurança.

O frontend pode enviar organization_id para facilitar inserts, mas a segurança real deve estar nas policies do Supabase.

## Estrutura mínima de tabelas

- organizations
- profiles
- works
- stages
- expenses
- work_updates

## Storage

Bucket inicial:

- obra-fotos

Bucket opcional:

- comprovantes

Padrão de path dos arquivos:

    organization_id/work_id/file-name

As policies de storage devem validar que o usuário autenticado pertence à organization_id presente no path.

Não permitir acesso a arquivos de outra organização.

Não usar service role no frontend.

## Views no Postgres

Views simples são permitidas para apoiar o dashboard.

View planejada:

- `dashboard_work_summary`

Essa view pode fornecer:

- total gasto por obra
- orçamento previsto
- diferença previsto x realizado
- percentual de progresso
- status visual da obra
- identificação de obras acima do previsto

Importante:
Não criar BI, relatórios avançados ou complexidade desnecessária.
Views simples para performance do dashboard são permitidas.
Relatórios avançados continuam fora do escopo.

## Performance e UX

- Evitar delays artificiais
- Não usar loading demorado sem necessidade
- Toda ação precisa ter resposta rápida
- Mostrar feedback simples:
  - Salvando...
  - Salvo com sucesso
  - Erro ao salvar
- Evitar múltiplos cliques para ações simples
- Formulários curtos
- Priorizar uso em celular

## Frontend

Seguir o visual já aprovado no protótipo.

Cores principais:

- Fundo geral: cinza muito claro
- Sidebar/topbar: azul escuro/navy
- Cards: branco
- Texto principal: grafite
- Destaques positivos: verde
- Alertas: vermelho suave
- Atenção: amarelo/laranja suave
- Bordas: cinza claro

Estilo:

- Visual limpo
- Cards arredondados
- Espaçamento confortável
- Ícones Lucide
- Layout profissional e leve
- Responsivo e mobile first

## Responsividade

Todo fluxo deve funcionar bem em:

- celular
- tablet
- desktop

No mobile:

- menu pode virar bottom nav ou drawer
- cards devem empilhar
- tabelas devem virar cards
- formulários devem ocupar largura total
- botões principais devem ser grandes e fáceis de tocar

## Naming

Código em inglês.
Interface em português.

Exemplos de código:

- organizations
- profiles
- works
- stages
- expenses
- work_updates
- organization_id
- work_id
- stage_id

Textos para usuário:

- Obras
- Etapas
- Despesas
- Fotos
- Atualizações
- Previsto
- Realizado

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
