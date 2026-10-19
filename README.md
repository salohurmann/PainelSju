# 🏛️ Portal de Gestão Integrada — SEJU / Governo do Estado do Paraná

> **Secretaria da Justiça e Cidadania do Estado do Paraná (SEJU)**  
> Plataforma corporativa unificada de governança, operações, frotas, tecnologia e controle fiscal em conformidade com as diretrizes do Governo do Estado do Paraná (gov.br e padrão de design silencioso e moderno).

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Decreto Estadual](https://img.shields.io/badge/Conformidade-Decreto%201.428%2FPR-0072BB)](#)
[![TCE-PR](https://img.shields.io/badge/Fiscaliza%C3%A7%C3%A3o-TCE--PR-009B54)](#)
[![Auditoria](https://img.shields.io/badge/Integridade-SHA--256%20ICP--PR-0072BB)](#)

---

## 🧭 Visão Geral

O **Portal de Gestão Integrada SEJU** reúne em um ambiente único e seguro os pilares essenciais de administração e atendimento da Secretaria:

1. **Gestão de Frotas & Viaturas Oficiais (`frota`)**: Requisição de saída com validação de CPF e ocupantes, despacho da Chefia de Gabinete em 1 clique, vistoria pericial em 4 ângulos, registro de odômetro/combustível e emissão de Passe Oficial de Viagem.
2. **Central de Atendimento & Suporte de TI (`chamados`)**: Quadro Kanban interativo (*A Fazer*, *Em Atendimento*, *Concluídos*), controle de SLA regressivo em tempo real, gaveta lateral de pareceres técnicos e abertura rápida de ordens de serviço.
3. **Reserva Inteligente de Salas & Auditórios (`salas`)**: Agendamento corporativo com mecanismo rígido de anti-colisão, régua de ocupação horária (08h às 18h), fita de calendário de 7 dias e checklist de apoio (Copa, Transmissão Híbrida e Suporte Técnico).
4. **Calculadora de Diárias & Viagens Oficiais (`diarias`)**: Emissão e cálculo oficial fundamentado no **Decreto Estadual nº 1.428/PR**, decomposição fazendária (50% Hospedagem, 35% Alimentação, 15% Locomoção), mapa tático do Paraná com rotas estaduais (BR-277, BR-376) e pré-visualização do Anexo I timbrado.
5. **Fundo Rotativo dos 19 CENSEs (`cense`)**: Gestão orçamentária descentralizada das 19 unidades socioeducativas do Paraná, leitor e scanner de DANFE NF-e (44 dígitos), segregação de rubricas `33.90.30` (Consumo) vs `33.90.39` (Serviços) e conformidade TCE-PR.
6. **Telefonia & Guia de Ramais (`ramais`)**: Diretório institucional da Sede Hauer e núcleos regionais, status de presença VoIP ao vivo, simulador de discagem e organograma hierárquico interativo.
7. **Trilha de Auditoria Criptográfica (`auditoria`)**: Registro imutável de todas as ações sensíveis com hash SHA-256, carimbo de tempo, anonimização LGPD de CPFs/IPs e selo de conformidade ICP-PR.

---

## 🎨 Design System Institucional (Padrão Silencioso e Moderno)

O front-end do portal foi estruturado a partir do **Design System Oficial SEJU**, inspirado nas melhores referências globais de software executivo (**Linear**, **Stripe**, **Vercel** e **gov.br**):

### Princípios de Design
- **Silencioso e Focado na Informação:** Eliminação de ruídos visuais, cantoneiras nos cantos, gradientes holográficos e elementos artificiais de IA.
- **Tipografia Escalar e Precisa:** Uso de `tabular-nums` para valores financeiros, quilometragens e relógios. Fontes monoespaçadas restritas a protocolos, placas de veículos e hashes.
- **Paleta Governamental:**
  - `Azul Paraná (#0072BB)`: Cor primária institucional e foco.
  - `Verde Paraná (#009B54)`: Confirmações, aprovações e status ativo.
  - `Superfícies Neutras`: `--surface` (#FFFFFF), `--surface-2` (#F8FAFC) e `--border` (#E2E8F0).
  - `Modo Midnight (Dark Mode)`: Superfícies profundas de ardósia para uso executivo noturno.

### Tokens de Design (`src/styles/tokens.css`)
Todas as variáveis visuais são centralizadas em tokens semânticos:
```css
:root {
  --brand: #0072bb;
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --text-muted: #64748b;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

### Biblioteca de Componentes Base (`src/components/ui/`)
- `Button`: Variantes Primary, Secondary, Ghost e Danger com estados de loading e tamanhos sm (32px), md (36px) e lg (40px).
- `Input`, `Select`, `Textarea`: Campos padronizados com altura de 40px, focus-ring acessível, label superior e suporte a ícones.
- `Card`: Superfície limpa com borda de 1px, raio de 12px e padding de 20px.
- `Badge`: Pílula de 22px de altura com fundo suave e texto escuro de alto contraste.
- `KpiStat`: Métricas em 28-32px com comparador de tendência e rótulos concisos.
- `Table`: Cabeçalho institucional, hover sutil e alinhamento numérico à direita.
- `Tabs`: Variantes Underline e Segmented Control.
- `Modal` & `Drawer`: Diálogos centralizados e painéis laterais com bloqueio de scroll e tecla `ESC`.
- `Toast`: Notificações discretas no canto inferior direito com timer automático de 4s.
- `PlacaMercosul`: Reprodução gráfica vetorial hiper-realista da placa brasileira padrão Mercosul.

---

## ⚡ Estrutura do Shell da Aplicação

- **Sidebar Fixa (264px)**:
  - Brasão oficial do Estado do Paraná em escala proporcional.
  - Navegação organizada em 4 categorias: *Principal*, *Operação & Logística*, *Administração & Finanças* e *Segurança & Controle*.
  - Estado colapsável para 72px e gaveta com backdrop em resoluções mobile (< 1024px).
  - Rodapé institucional com endereço oficial e telemetria de uptime (`GovCloud PR · 99.98%`).
- **Top Bar Horizontal (56px)**:
  - Breadcrumb dinâmico contextual (`SEJU > Frotas Oficiais`).
  - Campo de busca global com atalho universal `Ctrl + K`.
  - Alternador de tema Claro / Midnight.
  - Dropdown de notificações com badges numéricos de pendências.
  - Seletor de perfil com avatar e dados funcionais do servidor logado.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev) | Renderização reativa de alta performance |
| **Linguagem** | [TypeScript 6](https://www.typescriptlang.org) | Tipagem estática rigorosa e prevenção de regressões |
| **Build Tool** | [Vite 8.3](https://vitejs.dev) | Bundler ultrarrápido com tempo médio de build de 440ms |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com) + Tokens CSS | Sistema utility-first conectado ao design system |
| **Ícones** | [Lucide React](https://lucide.dev) | Iconografia proporcional (18px, stroke 1.75) |
| **Segurança** | Web Crypto API | Criptografia nativa SHA-256 para integridade de auditoria |

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

### 4. Compilar para produção (Build & Validação de Tipos)
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
* **Data Center:** GovCloud Paraná · Hospedagem Governamental de Alta Disponibilidade
