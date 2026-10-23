# 🏛️ Portal de Gestão Integrada — SEJU / Governo do Estado do Paraná

> **Secretaria da Justiça e Cidadania do Estado do Paraná (SEJU)**  
> Plataforma corporativa unificada de governança, operações, frotas, tecnologia e controle fiscal em conformidade com as diretrizes do Governo do Estado do Paraná (gov.br e padrão de design silencioso e moderno).

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Decreto Estadual](https://img.shields.io/badge/Conformidade-Decreto%201.428%2FPR-0072BB)](#)
[![TCE-PR](https://img.shields.io/badge/Fiscaliza%C3%A7%C3%A3o-TCE--PR-009B54)](#)
[![Auditoria](https://img.shields.io/badge/Integridade-SHA--256%20ICP--PR-0072BB)](#)
[![LGPD](https://img.shields.io/badge/Privacidade-LGPD%20Blindada-0A192F)](#)

---

## 🧭 Visão Geral

O **Portal de Gestão Integrada SEJU** reúne em um ambiente único e seguro os pilares essenciais de administração, operações e governança da Secretaria:

1. **Gestão de Frotas & Viaturas Oficiais (`frota`)**: Requisição de saída com validação de CPF e ocupantes, despacho da Chefia de Gabinete em 1 clique, vistoria pericial em 4 ângulos, registro de odômetro/combustível e emissão de Passe Oficial de Viagem.
2. **Central de Atendimento & Suporte de TI (`chamados`)**: Quadro Kanban interativo (*A Fazer*, *Em Atendimento*, *Concluídos*), controle de SLA regressivo em tempo real, gaveta lateral de pareceres técnicos e abertura rápida de ordens de serviço.
3. **Reserva Inteligente de Salas & Auditórios (`salas`)**: Agendamento corporativo com mecanismo rígido de anti-colisão, régua de ocupação horária (08h às 18h), fita de calendário de 7 dias e checklist de apoio (Copa, Transmissão Híbrida e Suporte Técnico).
4. **Calculadora de Diárias & Viagens Oficiais (`diarias`)**: Emissão e cálculo oficial fundamentado no **Decreto Estadual nº 1.428/PR**, decomposição fazendária (50% Hospedagem, 35% Alimentação, 15% Locomoção), mapa tático do Paraná com rotas estaduais (BR-277, BR-376) e pré-visualização do Anexo I timbrado.
5. **Fundo Rotativo dos 19 CENSEs (`cense`)**: Gestão orçamentária descentralizada das 19 unidades socioeducativas do Paraná, leitor e scanner de DANFE NF-e (44 dígitos), segregação de rubricas `33.90.30` (Consumo) vs `33.90.39` (Serviços) e conformidade TCE-PR.
6. **Telefonia & Guia de Ramais (`ramais`)**: Diretório institucional da Sede Hauer e núcleos regionais, status de presença VoIP ao vivo, simulador de discagem e organograma hierárquico interativo.
7. **Trilha de Auditoria Criptográfica (`auditoria`)**: Registro imutável de todas as ações sensíveis com hash SHA-256, carimbo de tempo, anonimização LGPD de CPFs/IPs e selo de conformidade ICP-PR.

---

## 🔐 Backend, Login e Permissões (Supabase)

O painel agora tem backend real em `supabase/`: banco Postgres com regras de acesso (RLS),
login por convite, papéis e permissões editáveis pelo admin, módulos restritos por setor,
auditoria encadeada e notificações em tempo real. As regras de negócio (segregação de funções,
anti-colisão, SLA, cálculo de diárias, validação de NF-e) rodam no banco e têm 137 testes.

- Guia de configuração passo a passo: [`supabase/README.md`](supabase/README.md)
- Sem as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o painel roda no modo
  demonstração local (dados fictícios, sem login), como antes.

* * *

## 🛡️ Arquitetura & Governança (Prompts 2, 3, 4 e 5)

A aplicação foi estruturada seguindo rigorosos padrões de engenharia institucional:

### 1. Monolito Modular & Manifestos de Módulos (`src/modules/`)
- **`moduleRegistry.ts`**: Cada módulo declara seu manifesto contendo identificador, ícone institucional, permissão mínima exigida, ações rápidas, regras de pendências e resumo para a tela inicial.
- **Desacoplamento de Navegação**: A barra lateral e o lançador de aplicativos na Home consomem os manifestos registrados filtrados dinamicamente pelas permissões do servidor conectado.

### 2. Barramento de Eventos de Domínio (`src/services/eventBus.ts`)
- Padrão Publisher/Subscriber em memória fortemente tipado.
- Os módulos emitem eventos de domínio (`viatura.solicitada`, `viatura.aprovada`, `chamado.criado`, `sala.reservada`, `cense.nfe_lancada`).
- **Serviço Transversal (`src/services/crossCuttingService.ts`)**: Assina os eventos e alimenta de forma automática a cadeia de logs criptográficos SHA-256 e a central de notificações, desacoplando completamente a lógica de interface.

### 3. Matriz RBAC & Regra de Ouro da Segregação de Funções (`src/services/rbac.ts`)
- Controle de acesso granular baseado em papéis (`servidor`, `gestor_frota`, `chefe_gabinete`, `admin`) no formato `modulo:acao`.
- **Segregação de Funções**: Um servidor **nunca** pode aprovar sua própria solicitação de viagem ou diária. Se o CPF do solicitante for idêntico ao do usuário logado, o botão de homologação é desabilitado e um aviso explícito de conformidade é exibido.

### 4. Proteção de Dados LGPD (`src/components/ui/MascaraCpfLgpd.tsx`)
- Todos os CPFs exibidos em tabelas e formulários são mascarados por padrão (`***.456.789-**`).
- A revelação temporária dos dígitos é feita mediante clique voluntário, que dispara evento no barramento de auditoria registrando o servidor solicitante e o contexto.
- Conta com temporizador de **auto-remasking após 10 segundos** para proteger dados em telas desacompanhadas.

### 5. Interatividade & Atalhos Globais de Teclado
- **Rascunho Automático com Debounce (500ms)**: Preenchimentos no formulário de veículos são persistidos no `localStorage` e recuperados automaticamente em caso de navegação acidental.
- **Polling Inteligente com Detecção de Aba Oculta (`src/hooks/useSmartPolling.ts`)**: Pausa sincronizações periódicas quando a aba é minimizada, poupando CPU e bateria, e executa verificação instantânea no instante em que o usuário retorna.
- **Atalhos Globais**:
  - `Ctrl + K`: Busca Rápida e Paleta de Comandos.
  - `?`: Guia Completo de Atalhos.
  - `Esc`: Fechar modais, gavetas e menus.
  - `G + H`: Ir para o Painel Geral (Home).
  - `G + F`: Ir para Frotas & Viaturas.
  - `G + C`: Ir para Chamados & Suporte TI.
  - `G + S`: Ir para Reserva de Salas.
  - `G + D`: Ir para Diárias & Deslocamentos.
  - `G + R`: Ir para Fundo Rotativo CENSE.
  - `G + T`: Ir para Telefonia & Ramais.
  - `G + A`: Ir para Trilha de Auditoria SHA-256.

### 6. Observabilidade & Painel de Suporte N1/N2 (`src/components/navigation/PainelDiagnosticoModal.tsx`)
- Acessível diretamente pelo rodapé (`GovCloud PR · 99.98%`) ou pelo menu do servidor no topo.
- Exibe telemetria em tempo real do ambiente, consumo do armazenamento local e buffer de eventos do barramento.
- Botão de **1-Clique para Copiar Relatório Estruturado (JSON)** pronto para abertura de chamados na Celepar.

---

## 🧪 Testes Automatizados & CI/CD

O projeto possui suíte de testes unitários com **Vitest** cobrindo regras críticas de negócio:

```bash
npm test
```

### Cobertura de Testes:
- **`src/tests/regrasNegocio.test.ts`**:
  - Validador oficial de CPF (Algoritmo Módulo 11 da Receita Federal).
  - Cálculo de diárias e decomposição fazendária do **Decreto Estadual nº 1.428/PR**.
  - Mecanismo anti-colisão de horários de reserva de salas corporativas.
- **`src/tests/rbac.test.ts`**:
  - Matriz de permissões por perfil.
  - Regra de ouro da segregação de funções (bloqueio de auto-aprovação).
- **`src/tests/eventBus.test.ts`**:
  - Emissão, escuta tipada, cancelamento de inscrição e histórico circular de eventos.

### Esteira CI/CD GitHub Actions (`.github/workflows/ci.yml`)
- Disparada em todo `push` ou `pull request` para o branch `main`.
- Executa checagem estrita de tipos TypeScript (`tsc -b`), testes unitários (`npm test`) e compilação do bundle de produção (`npm run build`).

---

## 🎨 Design System Institucional (Padrão Silencioso e Moderno)

O front-end do portal foi estruturado a partir do **Design System Oficial SEJU**, inspirado nas melhores referências globais de software corporativo (**Linear**, **Stripe**, **Vercel** e **gov.br**):

### Princípios Visuais:
- **Silencioso e Focado na Informação:** Eliminação de ruídos visuais, cantoneiras exageradas, gradientes holográficos e elementos artificiais.
- **Tipografia Escalar:** Uso de `tabular-nums` para valores monetários, quilometragens e cronômetros.
- **Paleta Governamental:**
  - `Azul Paraná (#0072BB)`: Cor primária institucional e foco.
  - `Verde Paraná (#009B54)`: Confirmações, aprovações e status ativo.
  - `Superfícies Neutras`: `--surface` (#FFFFFF), `--surface-2` (#F8FAFC) e `--border` (#E2E8F0).
  - `Modo Midnight`: Superfícies de ardósia para uso executivo noturno.

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/salohurmann/PainelSju.git
cd PainelSju
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse no navegador: **`http://localhost:5173/`**

### 4. Executar os testes automatizados
```bash
npm test
```

### 5. Compilar para produção (Build & Validação de Tipos)
```bash
npm run build
```
Os artefatos minificados são gerados em `dist/` com validação completa do `tsc -b`.

---

## 🏛️ Identificação e Governança Institucional

* **Órgão Responsável:** Secretaria da Justiça e Cidadania do Estado do Paraná (SEJU)
* **Governo:** Governo do Estado do Paraná
* **Endereço Oficial:** Rua Tenente Francisco Ferreira de Souza, 766 – Hauer – Curitiba/PR – CEP 81630-010
* **Central Telefônica:** (41) 3210-2400
* **Privacidade & DPO:** `dpo@seju.pr.gov.br`
* **Data Center:** GovCloud Paraná · Hospedagem Governamental de Alta Disponibilidade (Celepar)
