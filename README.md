This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Painel editorial (`/admin`)

Rota interna para subir notícia sem passar por editor de texto e commit à mão.
Não é linkada em lugar nenhum do site, sai com `noindex` e fica atrás de senha.

Na Vercel o sistema de arquivos é somente leitura em runtime, então o painel não
grava o `.md` no disco: ele monta um commit no GitHub com a matéria **e** a
imagem juntas — via Git Data API, num único commit — e o deploy automático
republica o site. Leva cerca de um minuto entre publicar e o texto estar no ar.

Variáveis necessárias, em `.env.local` no dev e no projeto da Vercel em
produção (modelo em `.env.example`):

| Variável | Para quê |
| --- | --- |
| `ADMIN_SENHA` | Senha única de acesso, compartilhada pela redação. |
| `ADMIN_SESSION_SECRET` | Assina o cookie de sessão. Gere com `openssl rand -base64 32`. |
| `GITHUB_TOKEN` | Fine-grained token com escrita em *Contents*, restrito a este repositório. |
| `GITHUB_REPO` | Opcional. Padrão `FelipeLopes96/O_Corner`. |
| `GITHUB_BRANCH` | Opcional. Padrão `main`. |

Rodando localmente, o painel também commita no GitHub — para ver a matéria no
`next dev` é preciso dar `git pull` depois.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
