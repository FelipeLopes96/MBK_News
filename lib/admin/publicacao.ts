import matter from "gray-matter";
import { categorias } from "@/lib/noticias";
import type { PosicaoDaImagem } from "@/lib/conteudo";
import type { ArquivoParaCommit } from "@/lib/admin/github";
import { gerarSlug } from "@/lib/admin/slug";

/**
 * Traduz o que o formulário do painel envia para os arquivos que o site lê:
 * um `.md` em `content/noticias/` e, quando há capa, a imagem em
 * `public/noticias/`. O frontmatter gerado aqui precisa bater com o que
 * `lib/noticias.ts` espera — é a única cola entre o painel e o site.
 */

export const POSICOES_DA_IMAGEM: PosicaoDaImagem[] = [
  "centro",
  "topo",
  "base",
  "esquerda",
  "direita",
];

/** Formatos que o `next/image` otimiza bem e que o site já usa. */
const EXTENSOES_ACEITAS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

/** Abaixo do `bodySizeLimit` das Server Actions, para o erro sair legível. */
const TAMANHO_MAXIMO_DA_IMAGEM = 6 * 1024 * 1024;

export type FonteInformada = {
  rotulo: string;
  url: string;
};

export type DadosDaNoticia = {
  title: string;
  slug: string;
  date: string;
  categoria: string;
  resumo: string;
  corpo: string;
  destaque: boolean;
  fontes: FonteInformada[];
  /** Capa enviada pelo formulário. Ausente, cai em `imagemUrl`. */
  imagem?: { nome: string; bytes: Buffer };
  /** Alternativa ao upload: capa já hospedada em outro lugar. */
  imagemUrl: string;
  imagemPosicao: string;
  imagemCredito: string;
  imagemFonte: string;
  imagemLicenca: string;
  /** Capa criada com IA — sai rotulada como tal na matéria. */
  imagemGeradaPorIA: boolean;
};

export type Publicacao = {
  slug: string;
  caminhoDoMarkdown: string;
  arquivos: ArquivoParaCommit[];
  mensagemDoCommit: string;
};

function extensaoDe(nome: string): string {
  return nome.split(".").pop()?.toLowerCase() ?? "";
}

// A data de hoje no fuso da redação vive em `lib/datas.ts`: a agenda de eventos
// precisa da mesma regra, e duas cópias divergiriam.
export { dataDeHoje } from "@/lib/datas";

/**
 * Erros de preenchimento, todos de uma vez — o editor corrige tudo numa
 * passada em vez de descobrir um campo por submit.
 */
export function validar(dados: DadosDaNoticia): string[] {
  const erros: string[] = [];

  if (!dados.title.trim()) erros.push("O título é obrigatório.");
  if (!dados.resumo.trim()) erros.push("O resumo é obrigatório.");
  if (!dados.corpo.trim()) erros.push("O corpo da matéria é obrigatório.");

  if (!categorias.some((categoria) => categoria.slug === dados.categoria)) {
    erros.push("Escolha uma categoria válida.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.date)) {
    erros.push("A data precisa estar no formato AAAA-MM-DD.");
  }

  if (!gerarSlug(dados.slug || dados.title)) {
    erros.push("Não foi possível gerar um slug a partir do título.");
  }

  if (dados.imagem) {
    if (!EXTENSOES_ACEITAS.includes(extensaoDe(dados.imagem.nome))) {
      erros.push(
        `Formato de imagem não aceito. Use ${EXTENSOES_ACEITAS.join(", ")}.`
      );
    }
    if (dados.imagem.bytes.byteLength > TAMANHO_MAXIMO_DA_IMAGEM) {
      erros.push("A imagem passa de 6 MB. Comprima antes de subir.");
    }
  }

  if (dados.imagemPosicao && !POSICOES_DA_IMAGEM.includes(dados.imagemPosicao as PosicaoDaImagem)) {
    erros.push("Posição de corte inválida.");
  }

  // Créditos sem imagem alguma são um sintoma de campo preenchido no lugar errado.
  const temImagem = Boolean(dados.imagem || dados.imagemUrl.trim());
  if (
    !temImagem &&
    (dados.imagemCredito.trim() ||
      dados.imagemLicenca.trim() ||
      dados.imagemGeradaPorIA)
  ) {
    erros.push("Há crédito de imagem preenchido, mas nenhuma imagem foi enviada.");
  }

  return erros;
}

/** Só os campos com conteúdo entram no frontmatter — nada de chave vazia no .md. */
function montarImagem(dados: DadosDaNoticia, url: string | undefined) {
  if (!url) return undefined;

  return {
    url,
    ...(dados.imagemPosicao ? { posicao: dados.imagemPosicao } : {}),
    ...(dados.imagemCredito.trim() ? { credito: dados.imagemCredito.trim() } : {}),
    ...(dados.imagemFonte.trim() ? { fonte: dados.imagemFonte.trim() } : {}),
    ...(dados.imagemLicenca.trim() ? { licenca: dados.imagemLicenca.trim() } : {}),
    ...(dados.imagemGeradaPorIA ? { geradaPorIA: true } : {}),
  };
}

/**
 * Fonte sem link vira string simples, como nas matérias já publicadas;
 * com link vira { rotulo, url }. As duas formas são aceitas por
 * `normalizarFontes`.
 */
function montarFontes(fontes: FonteInformada[]) {
  return fontes
    .filter((fonte) => fonte.rotulo.trim())
    .map((fonte) =>
      fonte.url.trim()
        ? { rotulo: fonte.rotulo.trim(), url: fonte.url.trim() }
        : fonte.rotulo.trim()
    );
}

export function montarPublicacao(dados: DadosDaNoticia): Publicacao {
  const slug = gerarSlug(dados.slug || dados.title);
  const arquivos: ArquivoParaCommit[] = [];

  // A capa é renomeada para o slug: evita colisão entre matérias e dispensa o
  // editor de se preocupar com o nome do arquivo que saiu da câmera.
  let urlDaImagem = dados.imagemUrl.trim() || undefined;
  if (dados.imagem) {
    const extensao = extensaoDe(dados.imagem.nome);
    urlDaImagem = `/noticias/${slug}.${extensao}`;
    arquivos.push({
      caminho: `public/noticias/${slug}.${extensao}`,
      conteudo: dados.imagem.bytes,
    });
  }

  const imagem = montarImagem(dados, urlDaImagem);

  const frontmatter = {
    title: dados.title.trim(),
    slug,
    date: dados.date,
    categoria: dados.categoria,
    resumo: dados.resumo.trim(),
    fontes: montarFontes(dados.fontes),
    ...(imagem ? { imagem } : {}),
    destaque: dados.destaque,
  };

  // `matter.stringify` serializa o YAML pelo js-yaml, então aspas e quebras de
  // linha do título e do resumo saem escapadas corretamente.
  const markdown = matter.stringify(`\n${dados.corpo.trim()}\n`, frontmatter);
  const caminhoDoMarkdown = `content/noticias/${dados.date}-${slug}.md`;

  arquivos.push({
    caminho: caminhoDoMarkdown,
    conteudo: Buffer.from(markdown, "utf8"),
  });

  return {
    slug,
    caminhoDoMarkdown,
    arquivos,
    mensagemDoCommit: `Feat: ${dados.title.trim()}`,
  };
}
