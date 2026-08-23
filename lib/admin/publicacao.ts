import matter from "gray-matter";
import { categorias } from "@/lib/noticias";
import type { PosicaoDaImagem } from "@/lib/conteudo";
import type { ArquivoParaCommit } from "@/lib/admin/github";
import { gerarSlug } from "@/lib/admin/slug";
import {
  marcadorDaImagem,
  marcadoresNoCorpo,
  markdownDaImagem,
  trocarMarcadores,
} from "@/lib/imagensNoCorpo";

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

/**
 * Capa e imagens do corpo sobem no MESMO POST, então o que estoura o
 * `bodySizeLimit` é a soma, não cada arquivo. Sem este teto o envio morreria no
 * limite do framework, que devolve erro de rede sem dizer qual foto pesou.
 */
const TAMANHO_MAXIMO_TOTAL = 20 * 1024 * 1024;

export type FonteInformada = {
  rotulo: string;
  url: string;
};

/**
 * Uma foto no meio do texto. A ordem no formulário é o número que o editor cita
 * no corpo — a primeira é `[imagem:1]`.
 */
export type ImagemDoCorpoInformada = {
  /** Vazio quando o editor abriu a linha e esqueceu de escolher o arquivo. */
  nome: string;
  bytes: Buffer;
  legenda: string;
  fonte: string;
  geradaPorIA: boolean;
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
  /** Fotos do meio do texto, na ordem em que o corpo as cita. */
  imagensDoCorpo: ImagemDoCorpoInformada[];
};

/**
 * O que muda quando a matéria já existe.
 *
 * `frontmatterOriginal` não é detalhe: o formulário não tem campo para `tags`,
 * `organizacoes`, `subtitulo` nem `autor`, e remontar o frontmatter só com o que
 * ele conhece apagaria esses campos em toda edição — a matéria perderia as tags
 * e sumiria do hub da organização sem ninguém entender por quê.
 */
export type Edicao = {
  frontmatterOriginal: Record<string, unknown>;
  /**
   * Onde a matéria estava. Se o editor mudou o slug ou a data, o caminho novo é
   * outro e o antigo precisa sair no mesmo commit.
   */
  caminhoAnterior: string;
};

export type Publicacao = {
  slug: string;
  caminhoDoMarkdown: string;
  arquivos: ArquivoParaCommit[];
  /** Caminhos a remover no mesmo commit — o .md antigo, quando a matéria mudou de endereço. */
  caminhosApagados: string[];
  /**
   * Onde as fotos do corpo vão parar. Ficam à parte porque a ação confere se já
   * existe arquivo nesses caminhos: o commit é montado com `base_tree`, então
   * gravar em cima apagaria a foto de outra matéria sem aviso.
   */
  caminhosDasImagensDoCorpo: string[];
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

  erros.push(...validarImagensDoCorpo(dados));

  const totalDeBytes =
    (dados.imagem?.bytes.byteLength ?? 0) +
    dados.imagensDoCorpo.reduce((soma, imagem) => soma + imagem.bytes.byteLength, 0);

  if (totalDeBytes > TAMANHO_MAXIMO_TOTAL) {
    erros.push(
      `As imagens somam ${emMegabytes(totalDeBytes)} MB e o envio aceita no máximo ${emMegabytes(TAMANHO_MAXIMO_TOTAL)} MB. Comprima os arquivos ou publique menos fotos.`
    );
  }

  return erros;
}

function emMegabytes(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1);
}

/**
 * A numeração das fotos do corpo é a posição no formulário, e é ela que o
 * marcador no texto cita. Por isso linha sem arquivo é erro, e não algo a
 * ignorar: descartá-la em silêncio deslocaria todas as seguintes, e cada
 * marcador passaria a apontar para a foto errada.
 */
function validarImagensDoCorpo(dados: DadosDaNoticia): string[] {
  const erros: string[] = [];
  const citados = new Set(marcadoresNoCorpo(dados.corpo));

  dados.imagensDoCorpo.forEach((imagem, indice) => {
    const numero = indice + 1;

    if (imagem.bytes.byteLength === 0) {
      erros.push(`A imagem ${numero} do corpo está sem arquivo escolhido.`);
      return;
    }

    if (!EXTENSOES_ACEITAS.includes(extensaoDe(imagem.nome))) {
      erros.push(
        `A imagem ${numero} do corpo está em formato não aceito. Use ${EXTENSOES_ACEITAS.join(", ")}.`
      );
    }

    if (imagem.bytes.byteLength > TAMANHO_MAXIMO_DA_IMAGEM) {
      erros.push(
        `A imagem ${numero} do corpo passa de 6 MB. Comprima antes de subir.`
      );
    }

    if (!citados.has(numero)) {
      erros.push(
        `A imagem ${numero} do corpo não foi posicionada no texto: clique onde ela deve entrar e use "Inserir no texto", ou escreva ${marcadorDaImagem(numero)} à mão.`
      );
    }
  });

  // O contrário também trava a publicação: marcador sem foto sairia impresso na
  // matéria como "[imagem:4]", no meio do parágrafo.
  const quantas = dados.imagensDoCorpo.length;
  for (const numero of citados) {
    if (numero < 1 || numero > quantas) {
      erros.push(
        quantas === 0
          ? `O corpo cita ${marcadorDaImagem(numero)}, mas nenhuma imagem foi adicionada à matéria.`
          : `O corpo cita ${marcadorDaImagem(numero)}, mas a matéria só tem ${quantas === 1 ? "uma imagem" : `${quantas} imagens`} no meio do texto.`
      );
    }
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

/**
 * Troca os marcadores pelas imagens de verdade, agora que o slug definiu o
 * caminho de cada arquivo.
 *
 * O texto alternativo cai na legenda quando ela existe e no título da matéria
 * quando não — é a mesma escolha que a capa já faz na página publicada.
 */
function aplicarImagensDoCorpo(
  corpo: string,
  imagens: ImagemDoCorpoInformada[],
  urls: string[],
  title: string
): string {
  return (
    trocarMarcadores(corpo, (numero) => {
      const imagem = imagens[numero - 1];
      const url = urls[numero - 1];
      if (!imagem || !url) return null;

      // Parágrafo próprio: é assim que o renderizador troca o <p> em volta da
      // imagem pelo <figure> com legenda e crédito. O painel já insere o
      // marcador em linha separada, mas quem digita à mão pode colá-lo no meio
      // da frase.
      return `\n\n${markdownDaImagem(url, imagem.legenda.trim() || title, imagem)}\n\n`;
    })
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Só as imagens que a matéria criou, que são as batizadas com o slug dela:
 * `<slug>.jpg` para a capa e `<slug>-imagem-N.jpg` para as do corpo.
 *
 * O recorte importa na exclusão. Uma capa apontada à mão para
 * `/noticias/outra-materia.jpg` não leva esse nome, não entra na conta e
 * continua no lugar — apagá-la deixaria a outra matéria sem foto.
 */
function ehImagemDaMateria(url: string, slug: string): boolean {
  // O slug sai de `gerarSlug`, que só deixa passar [a-z0-9-]: nada aqui precisa
  // de escape para virar regex.
  return new RegExp(`^/noticias/${slug}(-imagem-\\d+)?\\.[a-z0-9]+$`, "i").test(
    url
  );
}

/** As URLs de imagem citadas no .md: a capa no frontmatter e as fotos do corpo. */
function urlsDasImagens(frontmatter: Record<string, unknown>, corpo: string): string[] {
  const capa = frontmatter.imagem;
  const urlDaCapa =
    capa && typeof capa === "object" && typeof (capa as { url?: unknown }).url === "string"
      ? [(capa as { url: string }).url]
      : [];

  const noCorpo = [...corpo.matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)].map(
    (achado) => achado[1]
  );

  return [...urlDaCapa, ...noCorpo];
}

/**
 * Tudo que sai do repositório quando a matéria é excluída: o .md e as imagens
 * que são dela. Deduplicado porque a mesma foto pode aparecer duas vezes.
 */
export function arquivosDaMateria(
  caminhoDoMarkdown: string,
  frontmatter: Record<string, unknown>,
  corpo: string,
  slug: string
): string[] {
  const imagens = urlsDasImagens(frontmatter, corpo)
    .filter((url) => ehImagemDaMateria(url, slug))
    .map((url) => `public${url}`);

  return [...new Set([caminhoDoMarkdown, ...imagens])];
}

/**
 * O primeiro número de imagem do corpo ainda livre para este slug — um a mais
 * que o maior já gravado no texto.
 *
 * É o que impede uma foto adicionada numa edição de gravar por cima de outra
 * que a matéria ainda exibe.
 */
function primeiroNumeroLivre(corpo: string, slug: string): number {
  const numeros = [
    ...corpo.matchAll(new RegExp(`/noticias/${slug}-imagem-(\\d+)\\.`, "gi")),
  ].map((achado) => Number(achado[1]));

  return numeros.length === 0 ? 1 : Math.max(...numeros) + 1;
}

export function montarPublicacao(
  dados: DadosDaNoticia,
  edicao?: Edicao
): Publicacao {
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

  // "-imagem-N" e não só "-N": a matéria de slug "ufc-320-1" gravaria a capa
  // exatamente onde ficaria a primeira foto do corpo de "ufc-320".
  const caminhosDasImagensDoCorpo: string[] = [];
  // Numa matéria nova a contagem começa em 1; numa edição, depois da última foto
  // que o corpo já exibe.
  const primeiroNumero = edicao ? primeiroNumeroLivre(dados.corpo, slug) : 1;
  const urlsDasImagensDoCorpo = dados.imagensDoCorpo.map((imagemDoCorpo, indice) => {
    const nome = `${slug}-imagem-${primeiroNumero + indice}.${extensaoDe(imagemDoCorpo.nome)}`;
    const caminho = `public/noticias/${nome}`;

    arquivos.push({ caminho, conteudo: imagemDoCorpo.bytes });
    caminhosDasImagensDoCorpo.push(caminho);

    return `/noticias/${nome}`;
  });

  const imagem = montarImagem(dados, urlDaImagem);

  const corpo = aplicarImagensDoCorpo(
    dados.corpo.trim(),
    dados.imagensDoCorpo,
    urlsDasImagensDoCorpo,
    dados.title.trim()
  );

  /**
   * Os campos do original vêm primeiro para que os que o formulário não conhece
   * sobrevivam à edição. Espalhar antes também preserva a ordem das chaves: o
   * spread mantém a posição de quem já existia, então o .md editado não sai com
   * o frontmatter todo remexido no diff.
   */
  const frontmatter: Record<string, unknown> = {
    ...(edicao?.frontmatterOriginal ?? {}),
    title: dados.title.trim(),
    slug,
    date: dados.date,
    categoria: dados.categoria,
    resumo: dados.resumo.trim(),
    fontes: montarFontes(dados.fontes),
    ...(imagem ? { imagem } : {}),
    destaque: dados.destaque,
  };

  // Capa removida na edição: sem isto o `imagem` do original sobreviveria ao
  // spread e a matéria continuaria com a foto que o editor acabou de tirar.
  if (!imagem) delete frontmatter.imagem;

  // `matter.stringify` serializa o YAML pelo js-yaml, então aspas e quebras de
  // linha do título e do resumo saem escapadas corretamente.
  const markdown = matter.stringify(`\n${corpo}\n`, frontmatter);
  const caminhoDoMarkdown = `content/noticias/${dados.date}-${slug}.md`;

  arquivos.push({
    caminho: caminhoDoMarkdown,
    conteudo: Buffer.from(markdown, "utf8"),
  });

  // Mudar o slug ou a data muda o nome do arquivo. Sem apagar o antigo, a mesma
  // matéria ficaria publicada em dois endereços.
  const caminhosApagados =
    edicao && edicao.caminhoAnterior !== caminhoDoMarkdown
      ? [edicao.caminhoAnterior]
      : [];

  return {
    slug,
    caminhoDoMarkdown,
    arquivos,
    caminhosApagados,
    caminhosDasImagensDoCorpo,
    mensagemDoCommit: edicao
      ? `Fix: ${dados.title.trim()}`
      : `Feat: ${dados.title.trim()}`,
  };
}
