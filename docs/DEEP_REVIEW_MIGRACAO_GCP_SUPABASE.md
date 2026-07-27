# Revisão de Codebase: Plano de Descomissionamento Supabase e Migração GCP

Este documento apresenta uma revisão técnica exaustiva de todas as dependências do Supabase existentes na codebase do RevHackers e estabelece a nova arquitetura e padrões de refatoração para a migração para a Google Cloud Platform (GCP).

---

## 1. Inventário Completo de Dependências do Supabase

Após uma varredura profunda no código-fonte em `src/`, as chamadas ao cliente Supabase foram categorizadas em cinco pilares fundamentais de infraestrutura que precisarão ser substituídos na GCP:

### A. Autenticação e Sessões (`supabase.auth`)
*   **Onde é usado:** Principalmente no `src/contexts/AuthContext.tsx` e `src/context/AIContext.tsx`.
*   **Funções ativas:**
    *   `signInWithPassword` (Login convencional)
    *   `signInWithOtp` (Login por código de acesso único)
    *   `signUp` (Cadastro de usuários e parceiros)
    *   `resetPasswordForEmail` / `updateUser` (Recuperação de senhas)
    *   `onAuthStateChange` (Escuta e sincronização do estado de login)
    *   `signOut` (Encerramento de sessão)

### B. Banco de Dados e Queries (`supabase.from`)
No modelo legado do Supabase, o frontend faz requisições SQL-like diretas para o banco de dados. Isso viola o princípio de segurança planejada para o GCP, onde o navegador nunca se conectará diretamente ao Cloud SQL.
*   **Tabelas impactadas:**
    *   `opportunities` (pipeline de pré-vendas e dados de diagnósticos)
    *   `rei_projects` (dados e entregas do hub REI)
    *   `clients` (dados cadastrais de clientes)
    *   `materials` (materiais ricos, links e downloads)
    *   `blog_posts` (gerenciamento do blog institucional)
    *   `strategic_plans` (planos táticos de growth)
    *   `document_signatures` (controle de assinaturas eletrônicas)

### C. Funções Serverless (`supabase.functions.invoke`)
O sistema executa tarefas pesadas e chamadas a modelos de inteligência artificial através das Supabase Edge Functions.
*   **Funções mapeadas na codebase:**
    *   `scrape-profile`: Scraper do LinkedIn em `StepFounderLinkedIn.tsx`.
    *   `auto-enrich-project`: Motor de enriquecimento cadastral de CNPJ no background.
    *   `trigger-post-rei-enrichment`: Gatilho de inteligência executado pós-diagnóstico.
    *   `generate-playbook`: Gerador de inteligência tática comercial por IA.
    *   `agent-chat`: Motor do chat dos agentes de IA em `PostEditor.tsx`.
    *   `generate-image`: Geração automática de imagens de capa para o blog.
    *   `generate-success-plan`: Geração automatizada do plano de sucesso para novos clientes.

### D. Armazenamento de Arquivos (`supabase.storage`)
*   **Onde é usado:** `src/utils/uploadImageToSupabase.ts` e `src/utils/uploadFileToSupabase.ts`.
*   **Operações:** Upload de PDFs, documentos, relatórios e imagens de blog diretamente para Buckets públicos e privados.

### E. Comunicação em Tempo Real (`supabase.channel`)
*   **Onde é usado:** `Header.tsx` (escuta de novas notificações) e `KickoffSignaturePanel.tsx` (escuta de status de assinaturas de contratos).
*   **Operações:** Conexões WebSockets persistentes para reagir a alterações específicas de linhas nas tabelas do banco de dados.

---

## 2. Nova Topologia de Infraestrutura na Google Cloud Platform (GCP)

Para descomissionar o Supabase com 100% de segurança e conformidade técnica, mapeamos os equivalentes do ecossistema GCP:

```
+-------------------------------------------------------------------------+
|                    FRONTEND (React SPA / Vite / CDN)                    |
+-------------------+-----------------+-----------------+-----------------+
                    |                 |                 |
     (Identidade)   v                 v (CRUD / API)    v (Assets)
+-------------------+---+     +-------+-----------+   +-+-----------------+
| Google Cloud      |   |     | API Cloud Run     |   | Google Cloud      |
| Identity Platform |   |     | (NodeJS / Express)|   | Storage (GCS)     |
+-------------------+---+     +-------+-----------+   +-------------------+
                                      |
                                      v (Postgres Pool)
                              +-------+-----------+
                              | Cloud SQL         |
                              | (Postgres)        |
                              +-------------------+
```

### 1. Camada de Apresentação (Frontend)
*   **Hospedagem:** **Cloud Storage (GCS) Buckets** configurados como site estático integrados ao **Google Cloud CDN** para cache e performance, ou migrado para soluções de borda modernas (Vercel).
*   **Comunicação:** O frontend passa a ser 100% agnóstico a banco de dados. Ele se comunica exclusivamente com uma API centralizada via JSON/REST.

### 2. Camada de Aplicação e Negócio (API Server)
*   **Hospedagem:** **Google Cloud Run** rodando um container Docker com uma API robusta em **Node.js (Express ou Fastify)** ou Python.
*   **Segurança:** Toda e qualquer chamada ao banco de dados passa pela API no Cloud Run. O banco de dados fica em rede privada interna (VPC) inacessível pela internet.
*   **Autenticação:** Integração do middleware da API com o **Google Cloud Identity Platform** (ou Firebase Auth SDK) para verificação de tokens JWT no cabeçalho `Authorization: Bearer <JWT>`.

### 3. Camada de Persistência (Banco de Dados)
*   **Hospedagem:** **Google Cloud SQL (PostgreSQL)**.
*   **Migração de Dados:** Exportação e importação do schema DDL atual do Postgres do Supabase (as migrations existentes) diretamente para a instância SQL do GCP.

### 4. Camada de Armazenamento (Files e Images)
*   **Hospedagem:** Buckets privados e públicos no **Google Cloud Storage (GCS)**.
*   **Segurança:** Uploads seguros e controlados por meio de **Signed URLs** gerados sob demanda pela API no Cloud Run.

### 5. Camada de Tempo Real (Realtime)
*   **Hospedagem:** Implementação de um servidor de WebSockets leve (como **Socket.io** ou uWebSockets) rodando no Cloud Run de forma escalável (com session affinity habilitado), ou utilizando barramento de eventos nativo como **Google Cloud Pub/Sub**.

---

## 3. Padrões de Refatoração de Código: Supabase vs. GCP

### Exemplo A: Criação de Oportunidade (Banco de Dados)

*   **Como é hoje no Supabase (Navegador acessando o banco diretamente):**
    ```typescript
    // src/api/publicDiagnostic.ts
    const { data, error } = await supabase
        .from('opportunities')
        .insert({ client_name: 'Lead', client_email: 'lead@empresa.com' });
    ```

*   **Como será no GCP (Navegador chama a API e a API grava no Cloud SQL):**
    ```typescript
    // Frontend (React)
    const response = await fetch('https://api.revhackers.com/v1/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Lead', email: 'lead@empresa.com' })
    });
    const data = await response.json();

    // Backend (NodeJS / Express no Cloud Run + Prisma ou pg Pool)
    app.post('/v1/opportunities', async (req, res) => {
        const { name, email } = req.body;
        const result = await db.query(
            'INSERT INTO opportunities (client_name, client_email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]);
    });
    ```

### Exemplo B: Upload de Arquivos (Storage)

*   **Como é hoje no Supabase:**
    ```typescript
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    ```

*   **Como será no GCP (Signed URL Pattern):**
    ```typescript
    // 1. Frontend pede uma URL de upload assinada e segura para a API
    const { uploadUrl, publicUrl } = await fetch(`/v1/storage/signed-url?file=${fileName}`).then(r => r.json());

    // 2. Frontend faz o upload direto do arquivo binário para o Google Cloud Storage
    await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    ```

---

## 4. Estratégia de Transição em Fases (Zero Down-Time)

Conforme ditam as regras de conformidade e as decisões de negócio aprovadas do `PLANO-MESTRE.md`, o processo de transição deve ser incremental para garantir que a plataforma nunca fique offline:

*   **Fase 1: Replicação de Dados (Dual-Write):** A nova instância do Cloud SQL é provisionada. Durante um período de testes, a API escreve em ambos os bancos para garantir consistência e integridade das estruturas de dados.
*   **Fase 2: Migração Isolada de Funções (Cloud Run):** As Supabase Edge Functions são reescritas como rotas da API NodeJS ou Cloud Functions no GCP. O frontend passa a invocar essas APIs no GCP enquanto o banco de dados mestre ainda reside temporariamente no Supabase.
*   **Fase 3: Substituição da Autenticação:** Os usuários são migrados para o Google Cloud Identity Platform (importando os hashes de senhas existentes por scripts utilitários).
*   **Fase 4: Descomissionamento Total:** Corte final de rotas (DNS cutover) e desativação completa do projeto Supabase.
