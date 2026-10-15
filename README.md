# 🏛️ Portal de Gestão Integrada — SEJU / Governo do Estado do Paraná

> **Secretaria da Justiça e Cidadania do Estado do Paraná (SEJU)**  
> Plataforma unificada de serviços corporativos, despacho eletrônico, governança patrimonial e produtividade administrativa em conformidade com as diretrizes do Governo do Estado do Paraná.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Decreto Estadual](https://img.shields.io/badge/Conformidade-Decreto%201.428%2FPR-0072BB)](#)
[![Auditoria](https://img.shields.io/badge/Integridade-SHA--256%20ICP--PR-009B54)](#)

---

## 🧭 Visão Geral

O **Portal de Gestão Integrada SEJU** centraliza em um ambiente seguro, elegante e responsivo os cinco pilares operacionais do dia a dia da Secretaria:
1. **Gestão de Frotas & Veículos Oficiais**
2. **Central de Atendimento & OS de TI (Kanban)**
3. **Reserva Inteligente de Salas & Recursos**
4. **Calculadora & Concessão de Diárias (Decreto nº 1.428/PR)**
5. **Guia de Ramais & Organograma Interativo**

---

## 🎨 Identidade Visual & Experiência de Uso (UX)

O projeto segue com rigor os padrões de identidade visual e comunicação institucional do Estado do Paraná:
* **Paleta Oficial**:
  * `Azul Paraná (#0072BB)`: Destaques primários, ações de navegação e indicadores ativos.
  * `Verde Paraná (#009B54)`: Confirmações, aprovações e indicadores de economia pública.
  * `Azul Petróleo Governamental (#00385E / #002B49)`: Cabeçalhos nobres, tipografia de autoridade e rodapé institucional.
* **Brasão Oficial do Paraná**: Aplicação em alta resolução e fidelidade visual nos cabeçalhos, rodapé e nos documentos oficiais emitidos.
* **Design Executivo Livre de Artifícios**: Layout limpo, sem componentes genéricos, com alta densidade informacional corporativa e navegação ágil.
* **Áudio Feedback Sintetizado**: Módulo nativo (`soundFX.ts`) via Web Audio API para respostas táteis e sonoras instantâneas em cliques, avisos e confirmações, sem pesar na carga de rede.

---

## ⚡ Navegação Global & Interatividade

* **Command Palette Universal (`Ctrl + K` / Spotlight)**:
  * Pressione `Ctrl + K` em qualquer tela ou clique na barra de busca do topo.
  * Pesquisa *fuzzy* em tempo real por qualquer aplicativo, ação rápida (ex: *"Solicitar Carro"*, *"Abrir Chamado"*, *"Ramal Gabinete"*), placa de veículo ou rota.
  * Navegação completa por teclado com as setas (`↑`, `↓`) e tecla `Enter`.
* **Dock Flutuante Interativo (Estilo macOS / Dynamic Island)**:
  * Barra de navegação na parte inferior da tela com efeito de ampliação e elevação ao passar o mouse.
  * *Badges* numéricos em tempo real mostrando pendências (ex: requisições de veículos aguardando despacho).
  * Pips de indicação da aplicação ativa e botão direto para abrir a busca universal.
* **Header Executivo**:
  * Trilha de navegação (*breadcrumb*) dinâmica e contextual para retorno rápido à Central de Aplicativos.
  * Identificação do servidor logado, perfil de acesso funcional e atalho para o Command Palette.

---

## 🌟 Experiência Imersiva do Usuário (Design System & Simuladores)

O portal transcende o modelo tradicional de formulários administrativos, oferecendo uma experiência envolvente, tátil e gamificada para o servidor público:

### 1. 🚀 Modo "Jornada Interativa SEJU 360°" (Simulador Vivo de Missão)
Acessível a partir do botão com efeito luminoso no topo do Hub Central:
* **Passo 1 — Radar & Rota no Mapa do Paraná**: Mapa SVG dinâmico do Estado com traçado em neon das rodovias estaduais (`BR-277`, `BR-376`, `PR-445`), cálculo automático de pedágios, paradas estratégicas, consumo de combustível e tempo de trajeto.
* **Passo 2 — Garagem Digital**: Seleção visual do veículo oficial no pátio da SEJU (Corolla Híbrido, Spin 7 Lugares, Duster 4x4) com telemetria do odômetro e validação automática de capacidade da delegação a bordo.
* **Passo 3 — Despacho Eletrônico da Chefia**: Simulador de notificação *push* em tempo real com deliberação imediata, despacho oficial com assinatura digital ICP-PR e efeito comemorativo de confetes.
* **Passo 4 — Carteira Digital Apple Wallet**: Emissão instantânea do Passe Oficial de Trânsito em formato de cartão de carteira digital, com QR Code de autenticação para fiscalização rodoviária (BPRv/PRF) e hash criptográfico SHA-256.
* **Passo 5 — Vistoria Pericial 4 Fotos**: Checklist de pátio antes da partida, com registro fotográfico dos 4 ângulos do veículo e checagem de combustível e odômetro.

### 2. 📅 Widget "Minha Jornada Hoje" (O Dia do Servidor)
Painel inteligente fixado na tela principal do Hub Corporativo que sintetiza a rotina operacional do dia:
* **Reuniões do Dia**: Próximas reservas de auditórios/salas de conferência com indicação de participantes, horário e pauta.
* **Missões & Frotas**: Veículo agendado para o servidor com placa Mercosul em destaque e status de autorização do despacho.
* **Chamados de TI**: Acompanhamento dos chamados técnicos em andamento com barra de SLA regressiva em tempo real.
* **Barra de Ações Rápidas em 1 Clique**: Acesso direto para solicitação de diárias, consulta de ramais de servidores e abertura de chamados técnicos.

---

## 📱 Módulos e Funcionalidades Detalhadas

### 1. 🚗 Gestão de Frotas & Veículos Oficiais (`frota`)
Sistema completo de gestão de transporte institucional, controle de circulação e vistoria:
* **Requisição de Veículo Oficial**:
  * Validador oficial de CPF (algoritmo receita com verificação real de dígitos).
  * Seletor de modalidade: *Com Motorista Oficial* ou *Sem Motorista (Condução Própria)*.
  * Calendário dinâmico com identificação visual de dias disponíveis, ocupados e parcialmente ocupados (Manhã, Tarde ou Dia Inteiro).
  * **Atalhos Rápidos de Destinos do Paraná**: Cidades recorrentes da SEJU (*Ponta Grossa, Londrina, Maringá, Cascavel, Foz do Iguaçu, Paranaguá*) via rotas oficiais (`BR-277`, `BR-376`).
  * **Telemetria de Estrada & Estimativa de Custos em Tempo Real**:
    * Distância total computada ida e volta.
    * Consumo estimado em litros (referência média de 10,5 km/L).
    * Custo estimado para o Cartão Combustível do Estado (R$ 5,89/L).
    * Tempo médio de estrada por trecho.
  * **Validação Inteligente de Ocupantes**: Computa o solicitante + passageiros adicionais e valida contra a capacidade máxima do veículo escolhido, alertando e sugerindo veículos de 7 lugares (ex: Spin) caso o limite seja excedido.
* **Fila de Aprovação da Chefia de Gabinete**:
  * Painel exclusivo para deliberação de viagens em 1 clique (Aprovar / Reprovar com justificativa).
  * Notificações transacionais automáticas com protocolo oficial gerado.
* **Vistoria Digital de Check-in e Check-out (4 Fotos)**:
  * Inspeção fotográfica obrigatória dos 4 ângulos (*Frente, Traseira, Lateral Direita, Lateral Esquerda*).
  * Registro de odômetro (`km`) e nível de tanque (`%`) na saída e no retorno.
  * Carro *Blueprint 3D* com marcação de avarias na lataria.
  * **Assinatura Digital SHA-256**: Geração de hash criptográfico imutável gravando CPF do servidor, carimbo de data/hora, IP e parâmetros da vistoria.
* **Catálogo Patrimonial da Frota**:
  * Listagem de veículos com exibição de **Placa Mercosul estilizada** (faixa azul, bandeira do Brasil e brasão PR).
  * Indicadores de combustível, odômetro e status (*Disponível*, *Em Missão*, *Em Manutenção*).
  * Modal para cadastro de novos veículos oficiais.
* **Consulta de Agendamentos por CPF**:
  * Histórico de todas as requisições do servidor, acompanhamento de status e impressão de comprovante oficial.

---

### 2. 💻 Chamados & Ordem de Serviço TI (`chamados`)
Central interativa de atendimento técnico de tecnologia da informação e manutenção predial:
* **Quadro Kanban Interativo**:
  * Três colunas de fluxo operacional: *Triagem (A Fazer)*, *Em Atendimento* e *Concluídos*.
  * Interação *drag-and-drop* com transição suave e comemoração em confetes na conclusão.
* **Painel de Telemetria Operacional**:
  * 4 cartões com dados em tempo real: *Total de Demandas, Urgentes com SLA prioritário < 1h, Técnicos em Campo e Taxa de Resolução 100%*.
* **Busca Instantânea & Filtros de Urgência**:
  * Campo de busca rápida no topo do quadro por código do chamado, título, solicitante ou técnico responsável.
  * Filtros por categoria (*TI, Manutenção, Almoxarifado*) e por prioridade (*🔥 Urgentes, Altas, Todas*).
* **Gaveta Lateral de Inspeção Técnica (Drawer)**:
  * Abertura lateral ao clicar em qualquer chamado sem sair da tela.
  * Barra de SLA em contagem regressiva viva com alerta visual de tempo restante.
  * Linha do tempo de notas técnicas com campo para inserção imediata de novos pareceres.
  * Seletor de reatribuição de técnico responsável.
  * Botões de transição rápida de status da demanda.
* **Abertura de Chamado Simplificada**:
  * Formulário modal com seleção de setor, categoria, prazo e descrição da falha.

---

### 3. 📅 Reserva Inteligente de Salas & Recursos (`salas`)
Controle visual do Auditório Principal e das salas de reunião da sede da SEJU:
* **Régua Cronológica Visual (10 Horas de Expediente)**:
  * Visualização das 08:00 às 18:00 com blocos coloridos por setor e responsável.
  * **Mecanismo Anti-Colisão Rígido**: Impede a sobreposição de horários no mesmo espaço físico.
* **Fita de Calendário Rápido de 7 Dias**:
  * Seleção de dias úteis com contador de reuniões por data e input de calendário.
* **Badges de Ocupação em Tempo Real**:
  * Sinalização dinâmica: `🟢 Disponível agora` ou `🟡 Em uso no momento`.
* **Especificações de Layout da Sala**:
  * Indicação do formato de montagem: *Platéia / Auditório, Mesa Oval Executiva em U, Mesa Redonda de Mediação* ou *Estações com Computadores*.
* **Inspeção & Desocupação Imediata**:
  * Clique em qualquer reserva existente para visualizar pauta, solicitante e liberar/cancelar o horário em 1 clique.
* **Checklist de Apoio Institucional**:
  * Inclusão no agendamento de: *Serviço de Copa (Café & Água), Suporte Técnico Presencial, Gravação de Sessão / Ata Digital* e *Transmissão Híbrida (Teams / Meet PR)*.

---

### 4. 💼 Calculadora de Diárias & Viagens (`diarias`)
Módulo de cálculo de indenização de deslocamento fundamentado na legislação estadual:
* **Legislação Regulamentadora**:
  * Totalmente parametrizado conforme o **Decreto Estadual nº 1.428/PR**.
  * Diferenciação por localidade (*Interior do PR, Capital/Curitiba, Outro Estado, Exterior*) e por categoria funcional do servidor.
* **Itemização Fazendária Oficial**:
  * Decomposição da diária conforme auditoria da Secretaria da Fazenda:
    * **50%** Hospedagem
    * **35%** Alimentação
    * **15%** Locomoção Urbana
* **Presets de Justificativa Institucional em 1 Clique**:
  * Modelos pré-redigidos para *Vistoria Socioeducativa, Conselhos Tutelares & Cidadania, Capacitação Regional* e *Auditoria / Fiscalização*.
* **Comparador de Eficiência do Gasto Público**:
  * Medidor que demonstra a economia gerada aos cofres do Estado entre o uso de veículo próprio da frota versus passagens aéreas comerciais.
* **Pré-Visualização do Documento Oficial (Anexo I SEJU)**:
  * Modal com renderização fiel de documento timbrado para impressão A4:
    * Brasão Oficial do Estado do Paraná.
    * Número de protocolo SIAF.
    * Dotação orçamentária (*Fonte 100 - Tesouro Geral do Estado*).
    * Selo de validação digital ICP-PR com hash criptográfico SHA-256 e QR Code.

---

### 5. 📞 Guia de Ramais & Organograma Interativo (`ramais`)
Diretório telefônico e mapeamento das diretorias da Secretaria da Justiça e Cidadania:
* **3 Modos de Visualização Alternáveis**:
  * **Diretório Telefônico**: Lista de servidores com busca em tempo real por nome, setor, ramal ou andar.
  * **Organograma Institucional**: Estrutura hierárquica desde o Gabinete do Secretário até as Divisões Regionais. Clicar em um setor no organograma filtra automaticamente a equipe no diretório.
  * **Favoritos Rápidos ⭐**: Lista personalizada de contatos fixados pelo servidor para acesso diário.
* **Simulador de Ligação VoIP Institucional**:
  * Clique no botão "Ligar" para abrir o discador virtual com cronômetro de chamada ativo, botão de mudo/desmudo e encerramento.
* **Filtros Rápidos por Andar e Unidade**:
  * Atalhos para *Gabinete (3º Andar), DAG/Frotas, TI (2º Andar), Direitos Humanos* e *Ouvidoria Geral*.

---

### 6. 🔐 Trilha de Auditoria Criptográfica (`auditoria`)
* Registro transparente de todas as operações críticas do sistema (solicitações, despachos de chefia e check-ins de vistoria).
* Geração e verificação de hashes SHA-256 com garantia de integridade e não-repúdio.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev) | Biblioteca para interfaces reativas e performáticas |
| **Linguagem** | [TypeScript 5.7](https://www.typescriptlang.org) | Tipagem estática rigorosa para segurança de código |
| **Build Tool** | [Vite 8.3](https://vitejs.dev) | Bundler ultrarrápido com Hot Module Replacement (HMR) |
| **Estilização** | [Tailwind CSS v4](https://tailwindcss.com) | Design utility-first com tema oficial do Governo do Paraná |
| **Ícones** | [Lucide React](https://lucide.dev) | Conjunto de ícones vetoriais corporativos |
| **Efeitos** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Animações visuais leves para conclusão de demandas |
| **Segurança** | Web Crypto API | Algoritmo SHA-256 nativo do navegador para trilhas de auditoria |
| **Áudio** | Web Audio API | Síntese sonora procedural sem dependência de arquivos externos |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior recomendada)
* **npm** ou gerenciador de pacotes equivalente

### 1. Clonar o repositório
```bash
git clone https://github.com/salohurmann/PainelSju.git
cd PainelSju
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente (Opcional)
Copie o arquivo de exemplo para configurar o envio de e-mails institucionais:
```bash
cp .env.example .env
```
*(Edite o `.env` e insira sua chave da Brevo/Sendinblue caso deseje disparar e-mails reais).*

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse no seu navegador: **`http://localhost:5173/`**

### 5. Compilar para produção
```bash
npm run build
```
Os arquivos otimizados e minificados serão gerados no diretório `dist/`.

---

## 🏛️ Governança & Créditos

* **Órgão**: Secretaria da Justiça e Cidadania — SEJU
* **Governo**: Governo do Estado do Paraná
* **Sede**: Rua Tenente Francisco Ferreira de Souza, 766 – Hauer – Curitiba/PR
* **Central Telefônica**: (41) 3210-2400
* **Repositório**: [salohurmann/PainelSju](https://github.com/salohurmann/PainelSju)
