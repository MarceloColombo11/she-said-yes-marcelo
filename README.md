# Site de Casamento — Suelen & Marcelo

Site elegante e funcional para o casamento de Suelen e Marcelo. Data: **28 de novembro de 2026, às 16:30**.

## Tecnologias

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Google Maps Embed** (mapa, sem API key)
- **Google Apps Script** (RSVP)
- **Google Drive API** (upload resumível de fotos e vídeos dos convidados)

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Configuração

1. Copie `.env.local.example` para `.env.local`
2. Preencha as variáveis:

| Variável | Descrição |
|----------|-----------|
| `GOOGLE_APPS_SCRIPT_RSVP_URL` | URL da Web App de confirmação (somente servidor) |
| `GOOGLE_OAUTH_CLIENT_ID` | OAuth Desktop client (upload Drive) |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Secret do OAuth client |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | Refresh token da conta dona da pasta (`npm run drive:oauth`) |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta do Drive onde as mídias serão salvas |
| `NEXT_PUBLIC_SITE_URL` | (Opcional) URL pública do site — ajuda no CORS do upload |
| `NEXT_PUBLIC_WEDDING_DATE` | Data e hora (ex: 2026-11-28T16:30:00) |

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

## RSVP (Google Apps Script)

Na pasta `scripts/` está o código de **RSVP** (confirmações em planilha). Veja os comentários no arquivo para implantação.

## Personalização

- **Fotos**: adicione imagens em `public/images/` e atualize os JSONs em `data/`
- **Presentes**: edite `data/presentes.json` (inclua a chave Pix real)
- **Local**: atualize endereço, telefone e Instagram em `components/LocationSection.tsx`
- **Padrinhos/Damas**: edite `data/padrinhos.json`, `data/damas.json`, `data/convidados-honra.json`
- **Programação**: edite `data/programacao.json`

## Deploy na Vercel

```bash
npm run build
```

Configure no painel da Vercel (**Project Settings > Environment Variables**):

- `GOOGLE_APPS_SCRIPT_RSVP_URL`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`
- `NEXT_PUBLIC_WEDDING_DATE`
- (recomendado) `NEXT_PUBLIC_SITE_URL`

O `.env.local` é apenas para desenvolvimento local.
