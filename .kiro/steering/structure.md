# ObraVisão — Estrutura e organização

## Objetivo

Manter o projeto simples, organizado e rápido de evoluir.

O Beta 0.1 deve ser feito com frontend React + Vite e Supabase como backend.

Não criar NestJS nesta fase.

## Estrutura sugerida do frontend

src/
  components/
    ui/
    layout/
    dashboard/
    obras/
    despesas/
    fotos/
    etapas/
  pages/
    Dashboard/
    Obras/
    ObraDetalhe/
    Despesas/
    Fotos/
    Login/
    Cadastro/
  services/
    supabase/
    works/
    stages/
    expenses/
    work-updates/
    dashboard/
  hooks/
  lib/
  types/

## Supabase

Organizar arquivos relacionados ao Supabase em:

src/
  lib/
    supabase.ts
  services/
    supabase/
      auth.ts
      storage.ts

## Módulos principais

### Auth

Responsável por:

- cadastro
- login
- logout
- sessão do usuário autenticado
- carregamento do profile do usuário

### Organizations

Responsável por:

- empresa/organização do usuário
- isolamento de dados via organization_id
- criação automática via trigger no signup

### Works / Obras

Responsável por:

- cadastro da obra
- listagem de obras
- detalhe da obra
- status da obra
- orçamento previsto

### Stages / Etapas

Responsável por:

- etapas por obra
- status
- percentual
- previsão

### Expenses / Despesas

Responsável por:

- despesas por obra
- categorias
- valores
- datas
- comprovantes, se houver

### Work Updates / Fotos e atualizações

Responsável por:

- fotos da obra
- observações
- histórico visual
- vínculo opcional com etapa

Tabela: `work_updates`

### Dashboard

Responsável por:

- totais gerais
- obras atrasadas
- despesas do mês
- obras acima do previsto
- últimas atualizações
- previsto x realizado
- usa view `dashboard_work_summary`

## Regras de UI

- Toda tela deve ter título claro
- Toda tela deve ter CTA principal visível
- Toda listagem deve ter estado vazio
- Toda ação deve ter feedback
- Toda tela deve funcionar no celular
- Tabelas devem virar cards no mobile
- Evitar modais grandes no mobile
- Preferir páginas/drawers simples

## Estados obrigatórios

Para cada tela com dados:

- loading leve
- empty state
- error state
- success feedback

Sem exagerar em animações.

## Textos da interface

Sistema inteiro em português.

Exemplos:

- Nova obra
- Editar obra
- Lançar despesa
- Adicionar foto
- Atualizar etapa
- Em andamento
- No prazo
- Atrasada
- Acima do previsto
- Previsto
- Realizado
- Saldo
- Salvar
- Cancelar
- Excluir

## Padrão visual

Seguir a identidade do protótipo:

- Sidebar azul escura no desktop
- Cards brancos
- Fundo cinza claro
- Destaques verdes
- Alertas vermelhos suaves
- Badges de status
- Ícones Lucide
- Bordas suaves
- Cantos arredondados
- Tipografia limpa

## Não criar neste momento

- Backend NestJS
- Design system complexo
- Storybook
- Testes visuais
- Documentação por componente
- Permissões avançadas
- Financeiro completo
- Relatórios avançados
- Orçamento em PDF
