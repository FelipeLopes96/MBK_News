# MBK News

Portal independente de jornalismo especializado em esportes de combate — MMA,
boxe, muay thai, jiu-jitsu, kickboxing e wrestling.

Next.js 16 (App Router) + Tailwind CSS 4, publicado na Vercel. Não há banco de
dados: o conteúdo são arquivos Markdown versionados em `content/`, lidos no
build.

## Rodando

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

> Não rode `npm run build` com o `next dev` no ar: o build sobrescreve o `.next`
> que o servidor de desenvolvimento está usando e as páginas passam a responder
> 500. Para validar um build, sirva-o em outra porta.

## Como o conteúdo é organizado

| Pasta | O que é |
| --- | --- |
| `content/noticias/` | Matérias. O nome do arquivo começa com a data (`AAAA-MM-DD-slug.md`). |
| `content/arquivo/` | Conteúdo de longa duração: histórias, guias, explicações. |
| `content/organizacoes/` | Hubs de organização — UFC, PRIDE, ONE, WGP, Bellator. |
| `content/videos/` | Biblioteca de vídeos: um `.md` por vídeo do YouTube. |
| `content/lendas/` | Atletas que definiram eras. |
| `content/momentos/` | Momentos históricos. |
| `content/eventos.json` | Agenda de eventos: data, organização, local, cidade. |
| `content/mais-lidas.json` | Ranking da home: lista de slugs, da 1ª para a 5ª posição. |
| `public/noticias/` | Capas das matérias. |
| `public/marca/` | Logo e arte oficial do MBK News. |

Os relacionamentos são resolvidos por slug de organização, nunca dentro de
componente: publicar um `.md` novo já o faz aparecer nas listagens e no hub da
organização correspondente, sem tocar em código.

### Agenda de eventos

`content/eventos.json` é uma lista mantida à mão. Evento cuja data já passou
**sai da agenda sozinho** — não é preciso limpar o arquivo.

```json
{
  "id": 7,
  "organizacao": "UFC",
  "nome": "UFC 331: Fulano x Ciclano",
  "data": "2026-09-12",
  "hora": "23h",
  "local": "T-Mobile Arena",
  "cidade": "Las Vegas, Estados Unidos",
  "status": "a-confirmar"
}
```

`hora`, `local`, `cidade` e `status` são opcionais; sem `status`, o evento é
tratado como confirmado. A home e a `/eventos` revalidam de hora em hora,
porque "próximo evento" depende de que dia é hoje e o site é estático.

### Vídeos

Cada vídeo é um `.md` em `content/videos/`. Nenhum vídeo é hospedado aqui: o
que se guarda é a URL, e o portal monta o embed oficial do YouTube. O `videoId`
é **extraído da URL**, nunca digitado — `watch?v=`, `youtu.be/`, `/shorts/` e
`/embed/` são todos aceitos.

```yaml
---
title: "Edson Barboza fala sobre aposentadoria antes do UFC 330"
slug: entrevista-edson-barboza-ufc-330   # opcional; padrão é o nome do arquivo
descricao: "Entrevista concedida antes do card de sábado."
url: https://www.youtube.com/watch?v=XXXXXXXXXXX
canal: "MBK News"
duracao: "12:41"
categoria: mma                            # mesma lista das notícias
organizacoes: [ufc]                       # opcional
publicadoEm: 2026-08-14
noticias:                                 # slugs das matérias relacionadas
  - edson-barboza-admite-que-ufc-330-pode-ser-sua-ultima-luta
tags: ["Edson Barboza"]                   # opcional; liga o vídeo às lendas
destaque: false
thumbnail: /noticias/arte-propria.jpg     # opcional; padrão é a do YouTube
---
```

A ligação com as matérias é declarada **só aqui**, no campo `noticias`. O bloco
"Vídeos relacionados" no fim da matéria é derivado disso — não é preciso editar
o `.md` da matéria. E a seção `/videos` só aparece na navegação quando existe
pelo menos um vídeo cadastrado.

Vídeo cuja `url` não for reconhecida é descartado da biblioteca em vez de virar
um player vazio no ar; em desenvolvimento o console aponta o arquivo.

### Mais lidas

O ranking da home é **curado**, não medido: o site é estático e não há de onde
ler audiência no build. Preencha `content/mais-lidas.json` com os slugs na
ordem desejada e o módulo aparece na coluna lateral; com a lista vazia ele não
é renderizado, em vez de estampar "mais lidas" sobre um critério que não é
audiência.

```json
["slug-da-primeira", "slug-da-segunda", "slug-da-terceira"]
```

## Design system

Toda cor e toda fonte do site nascem do bloco `@theme` em `app/globals.css` —
nenhum componente escreve hex literal. Trocar um valor de lá repinta o portal
inteiro.

| Token | Uso |
| --- | --- |
| `fundo`, `superficie`, `superficie-alta` | Superfícies, do fundo da página para cima. |
| `linha`, `linha-forte` | Traços e divisórias. |
| `texto`, `texto-corpo`, `texto-suave`, `texto-fraco` | Hierarquia de texto. |
| `marca`, `marca-clara`, `marca-escura` | Azul MBK. Texto e link usam a variante clara, que passa AA sobre o fundo escuro. |
| `urgente` | Reservado a AO VIVO, BREAKING e urgência. |

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
| `GITHUB_REPO` | Opcional. Padrão `FelipeLopes96/MBK_News`. |
| `GITHUB_BRANCH` | Opcional. Padrão `main`. |
| `NEXT_PUBLIC_SITE_URL` | Opcional. Padrão `https://mbknews.vercel.app`. |

Rodando localmente, o painel também commita no GitHub — para ver a matéria no
`next dev` é preciso dar `git pull` depois.
