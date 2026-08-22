import {
  carregarBrutos,
  normalizarData,
  normalizarLista,
  normalizarOrganizacoes,
  textoOpcional,
  type ArquivoBruto,
} from "@/lib/conteudo";
import { normalizar } from "@/lib/busca";
import { getNoticiaPorSlug, type Noticia } from "@/lib/noticias";
import {
  extrairVideoId,
  urlDaMiniatura,
  type FormatoDoVideo,
} from "@/lib/youtube";

/**
 * Biblioteca de vídeos — a segunda frente editorial do portal.
 *
 * Cada vídeo é um `.md` em `content/videos`, no mesmo padrão do resto do
 * acervo: frontmatter com os campos e o corpo do arquivo para um texto de
 * apoio, quando houver. Vídeo nenhum é hospedado aqui; o que se guarda é a URL
 * e o que o portal precisa para montar o card e o embed oficial.
 *
 * A ligação com as matérias é declarada num lado só — `noticias` dentro do
 * vídeo — e o caminho inverso é derivado. Guardar nos dois lados garante que um
 * dia eles discordem.
 */

export type Video = {
  slug: string;
  title: string;
  descricao?: string;
  /** Hoje só YouTube; o campo existe para o dia em que houver outra. */
  plataforma: "youtube";
  /** URL original, como o editor colou. */
  url: string;
  /** Identificador extraído da URL — nunca digitado à mão. */
  videoId: string;
  formato: FormatoDoVideo;
  /** Miniatura própria. Ausente, cai na miniatura oficial do YouTube. */
  thumbnail: string;
  /** Canal de origem, para o crédito. */
  canal?: string;
  /** Duração como divulgada — ex.: "12:41". */
  duracao?: string;
  categoria: string;
  organizacoes: string[];
  /** Temas do vídeo — atletas, eventos, assuntos. Liga o vídeo às lendas. */
  tags: string[];
  /** Data ISO (AAAA-MM-DD). */
  publicadoEm: string;
  /** Slugs das matérias relacionadas. */
  noticias: string[];
  destaque: boolean;
  /** Corpo do `.md`, ainda em Markdown. Opcional. */
  conteudo: string;
};

const PASTA = "videos";

function slugDoVideo(bruto: ArquivoBruto): string {
  return String(
    bruto.data.slug ?? bruto.arquivo.replace(/\.md$/, "")
  );
}

/**
 * Vídeo sem URL reconhecível é descartado da biblioteca em vez de virar um
 * player vazio no ar. Em dev o aviso aponta o arquivo, para o editor corrigir.
 */
function ler(): Video[] {
  return carregarBrutos(PASTA)
    .flatMap((bruto): Video[] => {
      const { data, conteudo } = bruto;
      const url = textoOpcional(data.url) ?? "";
      const identificado = extrairVideoId(url);

      if (!identificado) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[videos] ${bruto.arquivo}: não reconheci um vídeo do YouTube em "${url}".`
          );
        }
        return [];
      }

      return [
        {
          slug: slugDoVideo(bruto),
          title: String(data.title ?? data.titulo ?? ""),
          descricao: textoOpcional(data.descricao ?? data.description),
          plataforma: "youtube",
          url,
          videoId: identificado.id,
          formato: identificado.formato,
          thumbnail:
            textoOpcional(data.thumbnail) ?? urlDaMiniatura(identificado.id),
          canal: textoOpcional(data.canal ?? data.channel),
          duracao: textoOpcional(data.duracao ?? data.duration),
          categoria: String(data.categoria ?? ""),
          organizacoes: normalizarOrganizacoes(data),
          tags: normalizarLista(data.tags),
          publicadoEm: normalizarData(data.publicadoEm ?? data.date),
          noticias: normalizarLista(data.noticias ?? data.relatedArticleIds),
          destaque: data.destaque === true || data.isFeatured === true,
          conteudo,
        },
      ];
    })
    // Mais recentes primeiro.
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

export function getTodosOsVideos(): Video[] {
  return ler();
}

export function getVideoPorSlug(slug: string): Video | undefined {
  return getTodosOsVideos().find((video) => video.slug === slug);
}

export function getVideosPorCategoria(categoria: string): Video[] {
  return getTodosOsVideos().filter((video) => video.categoria === categoria);
}

/**
 * Vídeos em destaque, os marcados primeiro. Sem nenhum marcado, os mais
 * recentes — o módulo da home não deve ficar vazio só porque ninguém lembrou de
 * marcar `destaque`.
 */
export function getVideosEmDestaque(quantidade: number): Video[] {
  const todos = getTodosOsVideos();
  const marcados = todos.filter((video) => video.destaque);
  const resto = todos.filter((video) => !video.destaque);

  return [...marcados, ...resto].slice(0, quantidade);
}

/** Vídeos ligados a uma matéria, na ordem em que o vídeo foi publicado. */
export function getVideosDaNoticia(slug: string): Video[] {
  return getTodosOsVideos().filter((video) => video.noticias.includes(slug));
}

/**
 * Vídeos que citam um atleta, encontrados pelas tags — mesma mecânica das
 * matérias, para a página da lenda não precisar de uma lista própria.
 */
export function getVideosDoAtleta(nomes: (string | undefined)[]): Video[] {
  const procurados = nomes
    .filter((nome): nome is string => Boolean(nome))
    .map(normalizar);

  if (procurados.length === 0) {
    return [];
  }

  return getTodosOsVideos().filter((video) =>
    video.tags.some((tag) => procurados.includes(normalizar(tag)))
  );
}

/** Caminho inverso: as matérias que um vídeo cita. */
export function getNoticiasDoVideo(video: Video): Noticia[] {
  return video.noticias
    .map((slug) => getNoticiaPorSlug(slug))
    .filter((noticia): noticia is Noticia => noticia !== undefined);
}

/**
 * Outros vídeos para oferecer no fim de um. Primeiro os da mesma categoria,
 * depois os mais recentes — para a lista nunca voltar vazia num acervo pequeno.
 */
export function getVideosRelacionados(video: Video, quantidade: number): Video[] {
  const outros = getTodosOsVideos().filter(
    (candidato) => candidato.slug !== video.slug
  );

  const mesmaCategoria = outros.filter(
    (candidato) => candidato.categoria === video.categoria
  );
  const resto = outros.filter(
    (candidato) => candidato.categoria !== video.categoria
  );

  return [...mesmaCategoria, ...resto].slice(0, quantidade);
}

/**
 * Versão enxuta de um vídeo, pronta para um card.
 *
 * Existe porque a biblioteca filtra no cliente: `Video` carrega o corpo do
 * `.md`, e o que cruza a fronteira precisa ser só o que o card mostra.
 */
export type CardDeVideo = {
  slug: string;
  title: string;
  categoria: string;
  /** Rótulo da categoria já resolvido — o cliente não lê o disco. */
  rotulo: string;
  thumbnail: string;
  formato: FormatoDoVideo;
  duracao?: string;
  canal?: string;
  publicadoEm: string;
};

export function paraCardDeVideo(
  video: Video,
  rotulo: string
): CardDeVideo {
  return {
    slug: video.slug,
    title: video.title,
    categoria: video.categoria,
    rotulo,
    thumbnail: video.thumbnail,
    formato: video.formato,
    duracao: video.duracao,
    canal: video.canal,
    publicadoEm: video.publicadoEm,
  };
}
