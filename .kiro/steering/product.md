# ObraVisão — Produto

## Visão

O ObraVisão é um SaaS de gestão à vista para pequenas construtoras, empresas de reforma, engenheiros, arquitetos e profissionais que ainda controlam obras por WhatsApp, planilhas e fotos espalhadas.

O objetivo do Beta 0.1 não é ser um ERP completo.

O objetivo é entregar uma primeira versão simples e usável para acompanhar obras, etapas, despesas, fotos, prazos e previsto x realizado.

## Público-alvo inicial

- Pequenas construtoras
- Empresas de reforma
- Engenheiros autônomos
- Arquitetos que acompanham obras
- Mestres de obra
- Profissionais que gerenciam múltiplas reformas

## Dor principal

O usuário precisa saber rapidamente:

- Quais obras estão em andamento
- Quais obras estão atrasadas
- Quais obras estão acima do orçamento previsto
- Quanto já foi gasto por obra
- Quais etapas estão paradas
- Quais fotos/atualizações foram registradas
- Onde estão as despesas e comprovantes da obra

## Posicionamento

Gestão à vista para obras e reformas.

Não vender como ERP.
Não construir como ERP.

O produto precisa ser simples, visual, rápido e fácil de usar.

## Escopo do Beta 0.1

Funcionalidades permitidas:

- Login e cadastro
- Organização/tenant
- Cadastro de obras
- Cadastro de etapas por obra
- Lançamento de despesas por obra
- Upload de fotos e atualizações
- Dashboard geral
- Previsto x realizado
- Isolamento seguro por tenant via Supabase RLS

## Fora do escopo do Beta 0.1

Não implementar agora:

- Backend NestJS
- Financeiro completo
- Contas a pagar
- Contas a receber
- Controle completo de equipe
- Folha de pagamento
- Orçamento em PDF
- Propostas comerciais
- Relatórios avançados
- App mobile nativo
- Integração com WhatsApp
- Notificações automáticas
- Permissões complexas
- Multi-filiais
- Estoque
- Emissão fiscal

## Princípios do produto

1. Mobile first
2. Tudo em português
3. Menos campos, mais velocidade
4. Fluxos simples
5. Dados visuais
6. Sem telas lentas
7. Sem carregamentos artificiais
8. Sem overengineering
9. Segurança por tenant desde o início
10. O usuário precisa entender a tela sem treinamento

## Linguagem

Usar termos simples:

- Obra
- Etapa
- Despesa
- Foto
- Atualização
- Previsto
- Realizado
- Em andamento
- Atrasada
- No prazo
- Acima do previsto

Evitar termos técnicos para o usuário final:

- Tenant
- Payload
- Entidade
- Workflow
- CRUD
- Módulo financeiro avançado
