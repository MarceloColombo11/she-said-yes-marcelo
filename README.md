# Site de Casamento — Suelen & Marcelo

Site elegante e funcional para o casamento de Suelen e Marcelo. Data: **28 de novembro de 2026, às 16:30**.

## Tecnologias

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **Google Maps Embed** (mapa, sem API key)
- **Google Apps Script** (RSVP e upload de fotos)

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
| `GOOGLE_APPS_SCRIPT_UPLOAD_URL` | URL da Web App de upload de fotos (somente servidor) |
| `NEXT_PUBLIC_WEDDING_DATE` | Data e hora (ex: 2026-11-28T16:30:00) |

## Scripts do Google Apps Script

Na pasta `scripts/` estão os códigos para:

- **RSVP**: insere confirmações em uma planilha do Google Sheets
- **Upload**: salva fotos em uma pasta do Google Drive

Veja os comentários nos arquivos para instruções de implantação.

## Personalização

- **Fotos**: adicione imagens em `public/images/` e atualize os JSONs em `data/`
- **Presentes**: edite `data/presentes.json` (inclua a chave Pix real)
- **Local**: atualize endereço, telefone e Instagram em `components/LocationSection.tsx`
- **Padrinhos/Damas**: edite `data/padrinhos.json`, `data/damas.json`, `data/convidados-honra.json`
- **Programação**: edite `data/programacao.json`

## Deploy na Vercel

O projeto pode ser implantado na Vercel:

```bash
npm run build
```

**Importante**: Configure `GOOGLE_APPS_SCRIPT_RSVP_URL` e `GOOGLE_APPS_SCRIPT_UPLOAD_URL` em **Project Settings > Environment Variables** no painel da Vercel. O `.env.local` é apenas para desenvolvimento local; em produção a Vercel usa as variáveis do projeto.
