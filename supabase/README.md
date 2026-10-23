# Backend do Painel SJU (Supabase)

O backend é um projeto Supabase: **Postgres + login + arquivos + funções de servidor**.
Toda regra de acesso e de negócio roda **no banco** (RLS, triggers e funções),
então ninguém contorna as regras mexendo no navegador.

Sem o Supabase configurado, o painel continua funcionando no **modo demonstração**
(dados fictícios no navegador, sem login), exatamente como antes.

---

## O que o backend garante

| Área | Regra aplicada no banco |
|---|---|
| **Login** | Só por convite da administração (cadastro público desligado). Senha com 10+ caracteres, maiúsculas, minúsculas e números. Conta desativada perde todo acesso na hora. |
| **Papéis e permissões** | 6 papéis (servidor, técnico de TI, gestão de frota, direção CENSE, chefia de gabinete, admin). A matriz papel → permissão é editável pelo admin, sem deploy. |
| **Módulos por setor** | Um módulo pode ser restrito a setores ou desligado. Isso bloqueia **os dados**, não só o menu. É aqui que a votação vai se encaixar. |
| **Dados pessoais** | CPF só é visível para o próprio servidor e para quem gere usuários. O diretório da equipe não expõe CPF. Revelar dado pessoal fica registrado. |
| **Frotas** | Ninguém aprova a própria solicitação. Veículo não pode ter reservas sobrepostas, nem estar em manutenção. Vistoria exige as 4 fotos e km que não diminui. Status só muda pelas funções oficiais. |
| **Chamados** | SLA calculado no banco pela prioridade (tabela editável). Solicitante não muda status nem técnico. Concluir exige solução. Notas internas só para a equipe técnica. |
| **Salas** | Anti-colisão por restrição do Postgres (impossível dupla reserva, mesmo com cliques simultâneos). Horário 07h–22h, capacidade da sala respeitada. |
| **Diárias** | Valor calculado no banco (o enviado pelo navegador é ignorado). Segregação de funções na aprovação. Etapas financeiras só para quem gere. |
| **CENSE** | DV real da chave NF-e e do CNPJ; CNPJ precisa bater com o emitente da chave; nota não é lançada duas vezes; quem lança não analisa. Saldo por unidade e competência. |
| **Auditoria** | Cada registro guarda o hash do anterior (cadeia SHA-256). Ninguém altera nem apaga registros. `verificar_auditoria()` aponta o primeiro registro adulterado. |
| **Notificações e e-mail** | Notificações in-app em tempo real. E-mails vão para uma fila no banco e são enviados por uma função de servidor; a chave do Brevo nunca vai para o navegador. |
| **Mesa de Despacho** | `minhas_pendencias()` devolve o que precisa da ação de quem está logado, ordenado por prazo. |

**Limites honestos:** os valores de diária são os que já estavam no front e **precisam
ser validados pela área fazendária** (tabela `diarias_tabela`, editável pelo admin).
A auditoria detecta adulteração, mas quem tem acesso de superusuário ao banco ainda
consegue desligar triggers; para valor jurídico seria preciso ancorar o hash fora do banco.
Dados reais da Secretaria fora da infraestrutura do Estado provavelmente exigem aval da TI/Celepar.

---

## Estrutura

```
supabase/
├── config.toml                  # configuração (login só por convite, política de senha)
├── migrations/                  # schema completo, em ordem
│   ├── …0100_base.sql             setores, papéis, permissões, perfis, módulos
│   ├── …0200_auditoria_notificacoes.sql
│   ├── …0300_frota.sql
│   ├── …0400_chamados.sql
│   ├── …0500_salas.sql
│   ├── …0600_diarias.sql
│   ├── …0700_cense_ramais.sql
│   └── …0800_sessao_storage_realtime.sql
├── seed.sql                     # catálogos + dados fictícios (veículos, salas, ramais, unidades)
├── functions/
│   ├── admin-usuarios/          # convidar pessoas, reenviar convite, redefinir senha
│   └── enviar-emails/           # envia a fila de e-mails pelo Brevo
└── tests/                       # 137 verificações das regras (rodam na CI)
scripts/seed-demo.mjs            # cria as contas fictícias de demonstração
src/data/supabase/               # camada de dados tipada usada pelas telas
src/auth/                        # sessão, login, definir senha
```

---

## Configuração (uma vez, ~20 minutos)

### 1. Criar o projeto
1. Em [supabase.com](https://supabase.com), crie um projeto. Região: **South America (São Paulo)**.
2. Guarde a senha do banco.

### 2. Aplicar o banco
Pelo terminal, na pasta do projeto:
```bash
npx supabase login
npx supabase link --project-ref <ref-do-projeto>     # o ref está na URL do painel
npx supabase db push --include-seed
```
> Alternativa sem terminal: no **SQL Editor** do Supabase, cole e execute cada arquivo
> de `supabase/migrations/` **na ordem** e depois o `supabase/seed.sql`.

### 3. Ajustar o login
No painel: **Authentication → Sign In / Providers**
- **Allow new users to sign up: DESLIGADO** (contas só por convite).
- **Authentication → URL Configuration:**
  - Site URL: `https://salohurmann.github.io/PainelSju/`
  - Redirect URLs: adicione também `http://localhost:5173/` para testar localmente.

### 4. Publicar as funções de servidor
```bash
npx supabase functions deploy admin-usuarios
npx supabase functions deploy enviar-emails --no-verify-jwt

npx supabase secrets set \
  SITE_URL=https://salohurmann.github.io/PainelSju/ \
  ALLOWED_ORIGINS=https://salohurmann.github.io,http://localhost:5173 \
  CRON_SECRET=<gere-um-valor-longo-aleatorio>
```
E-mail (opcional; sem isso as notificações aparecem só dentro do painel):
```bash
npx supabase secrets set BREVO_API_KEY=<chave> EMAIL_REMETENTE=<remetente-institucional> EMAIL_REMETENTE_NOME="SEJU · Painel"
```
Para enviar a fila a cada 2 minutos, ative as extensões **pg_cron** e **pg_net**
(Database → Extensions) e rode no SQL Editor:
```sql
select cron.schedule('enviar-emails', '*/2 * * * *', $$
  select net.http_post(
    url     := 'https://<ref-do-projeto>.supabase.co/functions/v1/enviar-emails',
    headers := jsonb_build_object('x-cron-secret', '<mesmo CRON_SECRET>', 'Content-Type', 'application/json'),
    body    := '{}'::jsonb
  );
$$);
```

### 5. Criar as contas de demonstração
Em **Project Settings → API** copie a **service_role key** (secreta: só no seu computador).
```bash
SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
DEMO_SENHA='EscolhaUmaSenha2026' \
node scripts/seed-demo.mjs
```
Contas criadas (todas com a senha de `DEMO_SENHA`, domínio `demo.painelsju.dev`):

| Conta | Papel | Para demonstrar |
|---|---|---|
| `lucia.viana@…` | Servidor (NAS) | solicitar veículo, abrir chamado, reservar sala |
| `carlos.silveira@…` | Servidor (CDH) | tem solicitação e diária pendentes |
| `otavio.carvalho@…` | Técnico de TI | atender chamados |
| `marcos.viana@…` | Gestão de frota | vistorias, cadastro de veículos |
| `maria.helena@…` | Chefia de gabinete | aprovar viagens e diárias, analisar notas CENSE |
| `direcao.cense@…` | Direção CENSE Curitiba | lançar notas fiscais |
| `admin@…` | Administração | tudo, inclusive papéis, setores e módulos |

### 6. Ligar o front
Local (`.env.local`, que não vai para o Git):
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```
No GitHub (para o site publicado): **Settings → Secrets and variables → Actions → Variables**,
crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Sem elas o site sai no modo demonstração.

> A anon key é pública por definição: quem protege os dados é o RLS. Nunca coloque a
> service_role key nem a chave do Brevo no front ou no GitHub.

### 7. Sua conta real de administrador
Convide você mesmo com a conta `admin@…` (ou crie em Authentication → Users) e, no SQL Editor:
```sql
update public.perfis set papel_id = 'admin' where email = 'seu.email@exemplo.gov.br';
```

---

## Integrar um módulo novo (ex.: a votação)
1. `insert into modulos (id, nome) values ('votacao', 'Votação');`
2. Crie as permissões no formato `votacao:acao` em `permissoes` e conceda aos papéis.
3. Restrinja ao setor: `insert into modulo_setores (modulo_id, setor_id) select 'votacao', id from setores where sigla = 'XXX';`
4. Nas políticas RLS das tabelas do módulo, use `public.tem_permissao('votacao:...')`.
   Ela já considera papel, setor e se o módulo está ligado.
5. Crie uma migration nova em `supabase/migrations/` e testes em `supabase/tests/`.

---

## Testar o banco localmente
Com um Postgres 15+ disponível:
```bash
PGHOST=localhost PGUSER=postgres PGPASSWORD=... bash supabase/tests/run.sh
```
O script cria um banco temporário, aplica tudo e roda os testes. A CI faz o mesmo a cada push.
