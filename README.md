# Site de Casamento — Suelen & Marcelo

Site elegante e funcional para o casamento de Suelen e Marcelo. Todo o conteúdo (textos, fotos, presentes, comitiva, programação, evento e confirmações de presença) fica num banco Postgres e é editado pelo painel em `/admin`.

## Tecnologias

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Neon Postgres + Drizzle ORM** (conteúdo do site e lista de convidados)
- **Google Maps Embed** (mapa, sem API key)
- **Google Drive API** (upload resumível de fotos e vídeos dos convidados)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Sem `DATABASE_URL`, o site público mostra o conteúdo padrão de `data/*.json` e a confirmação de presença fica indisponível.

## Configuração

1. Copie `.env.local.example` para `.env.local`
2. Preencha as variáveis:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string do Neon (a integração Vercel ↔ Neon cria automaticamente) |
| `ADMIN_USERNAME` | Usuário do painel `/admin` |
| `ADMIN_PASSWORD_HASH` | Hash da senha do painel (`npm run admin:hash` pede a senha e imprime o hash) |
| `ADMIN_SESSION_SECRET` | Segredo aleatório com 32+ caracteres para assinar a sessão |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth Desktop client (upload Drive) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Secret do OAuth client |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Refresh token da conta dona da pasta (`npm run drive:oauth`) |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta do Drive onde as mídias serão salvas |
| `NEXT_PUBLIC_SITE_URL` | (Opcional) URL pública do site — ajuda no CORS do upload |

## Banco de dados

1. Crie o banco pela integração **Neon** no painel da Vercel (Storage) e copie a `DATABASE_URL` para o `.env.local`.
2. Aplique as migrações:

```bash
npm run db:migrate
```

3. Gere o hash da senha do admin e preencha `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET` (ex.: `openssl rand -base64 48`).

Na primeira leitura, o banco é populado automaticamente com o conteúdo de `data/*.json` e com os textos atuais do site. Depois disso, o banco é a única fonte: edite tudo pelo `/admin`.

Ao mudar `lib/db/schema.ts`, gere uma nova migração com `npm run db:generate` e aplique com `npm run db:migrate`.

## Painel admin (`/admin`)

- **Convidados**: grupos e lista de convidados, status de cada um, totais (pessoas, acompanhantes, microônibus) e confirmações que não bateram com nenhum nome da lista, para vincular ou criar convidado.
- **Presentes**: título, descrição, foto, Pix e ordem.
- **Fotos**: fotos da capa e do carrossel “Sobre Nós”.
- **Comitiva**: padrinhos, convidados de honra e damas, com foto, zoom e enquadramento.
- **Programação**: momentos do dia, ícone e destaque.
- **Evento e local**: data/horário (contagem regressiva, agenda e `.ics`), endereço, mapa, Instagram e logo do local.
- **Textos**: Sobre Nós, títulos das seções, RSVP, página `/confirmacao`, rodapé e compartilhamento.

## Confirmação de presença

O convidado digita o nome e recebe sugestões da lista cadastrada no admin. Se escolher uma sugestão, o status do convidado é atualizado direto; se não, a resposta entra em “confirmações sem vínculo” no painel. Os campos extras (e-mail, acompanhante, microônibus e mensagem) ficam visíveis no admin.

## Upload de mídias (Google Drive)

Convidados enviam **várias fotos e vídeos** (até **200 MB** cada). O arquivo vai **direto do celular ao Drive**; a Vercel só abre a sessão de upload.

> **Importante:** Service Account **não grava** em Drive pessoal (erro `storageQuotaExceeded`). Use **OAuth** da conta Google que é dona da pasta.

### Setup OAuth (recomendado)

1. No [Google Cloud Console](https://console.cloud.google.com/), ative a **Google Drive API**.
2. **Credentials → Create credentials → OAuth client ID → Desktop app**.
3. Copie Client ID e Client Secret para o `.env.local`:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
4. Defina `GOOGLE_DRIVE_FOLDER_ID` (ID na URL da pasta).
5. Rode uma vez (com a conta dona da pasta logada no navegador):

```bash
npm run drive:oauth
```

6. Cole o `GOOGLE_OAUTH_REFRESH_TOKEN` impresso no `.env.local` e na Vercel.
7. Remova `GOOGLE_SERVICE_ACCOUNT_*` se existirem (não são necessários).
8. Reinicie `npm run dev`.

### Fluxo técnico

1. Cliente: `POST /api/upload/session` com `{ fileName, mimeType, size }`
2. Servidor: autentica (OAuth refresh) e inicia upload resumível no Drive (header `Origin` para CORS)
3. Cliente: envia o arquivo em chunks (~8 MB) direto à URL do Drive, com retry/resume

O script antigo `scripts/google-apps-script-upload.js` é **legado** e não deve ser usado.

## Deploy na Vercel

```bash
npm run build
```

Configure no painel da Vercel (**Project Settings > Environment Variables**):

- `DATABASE_URL` (já vem da integração Neon)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH`
- `ADMIN_SESSION_SECRET`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`
- (recomendado) `NEXT_PUBLIC_SITE_URL`

Rode `npm run db:migrate` apontando para o banco de produção antes do primeiro deploy (e sempre que houver migração nova em `drizzle/`).

O `.env.local` é apenas para desenvolvimento local.
