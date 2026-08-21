import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  normalizarData,
  normalizarFontes,
  normalizarImagem,
  normalizarLista,
  normalizarOrganizacoes,
  textoOpcional,
  type Fonte,
  type ImagemComCredito,
} from "@/lib/conteudo";
import { REDACAO } from "@/lib/seo";

/** Imagem de capa com os dados de atribuição exigidos na publicação. */
export type ImagemDeNoticia = ImagemComCredito;

export type Noticia = {
  title: string;
  /** Linha de apoio sob o título, quando a matéria tem olho. */
  subtitulo?: string;
  slug: string;
  /** Data em formato ISO (AAAA-MM-DD). */
  date: string;
  categoria: string;
  resumo: string;
  /** Assinatura da matéria. Sem `autor` no frontmatter, assina a redação. */
  autor: string;
  imagem?: ImagemDeNoticia;
  /** Veículos consultados na apuração, exibidos no fim da matéria. */
  fontes: Fonte[];
  /** Temas livres da matéria — atletas, eventos, assuntos. */
  tags: string[];
  /**
   * Organizações citadas (slugs de content/organizacoes). É o que liga a
   * matéria ao hub da organização, do mesmo jeito que já vale no Arquivo.
   */
  organizacoes: string[];
  destaque: boolean;
  /** Corpo do arquivo .md, ainda em Markdown. */
  conteudo: string;
};

export type Categoria = {
  slug: string;
  rotulo: string;
};

/**
 * Fonte única de verdade das categorias — alimenta o Header, o Footer, o painel
 * e a rota /[categoria]. A ordem daqui é a ordem da navegação.
 *
 * São modalidades, não organizações: UFC, ONE, PFL e Bellator entram pelo campo
 * `organizacoes` da matéria, que resolve para os hubs do Arquivo.
 */
export const categorias: Categoria[] = [
  { slug: "mma", rotulo: "MMA" },
  { slug: "boxe", rotulo: "Boxe" },
  { slug: "muay-thai", rotulo: "Muay Thai" },
  { slug: "jiu-jitsu", rotulo: "Jiu-Jitsu" },
  { slug: "kickboxing", rotulo: "Kickboxing" },
  { slug: "wrestling", rotulo: "Wrestling" },
];

export const NOTICIAS_POR_PAGINA = 9;

const diretorioDeNoticias = path.join(process.cwd(), "content", "noticias");

function lerNoticias(): Noticia[] {
  const arquivos = fs
    .readdirSync(diretorioDeNoticias)
    .filter((arquivo) => arquivo.endsWith(".md"));

  const noticias = arquivos.map((arquivo) => {
    const bruto = fs.readFileSync(path.join(diretorioDeNoticias, arquivo), "utf8");
    const { data, content } = matter(bruto);

    return {
      title: String(data.title ?? ""),
      subtitulo: textoOpcional(data.subtitulo ?? data.olho),
      slug: String(data.slug ?? arquivo.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "")),
      date: normalizarData(data.date),
      categoria: String(data.categoria ?? ""),
      resumo: String(data.resumo ?? ""),
      // Toda matéria sai assinada: sem `autor` no frontmatter, pela redação.
      autor: textoOpcional(data.autor) ?? REDACAO,
      imagem: normalizarImagem(data.imagem),
      fontes: normalizarFontes(data.fontes),
      tags: normalizarLista(data.tags),
      organizacoes: normalizarOrganizacoes(data),
      destaque: data.destaque === true,
      conteudo: content.trim(),
    } satisfies Noticia;
  });

  // Mais recentes primeiro.
  return noticias.sort((a, b) => b.date.localeCompare(a.date));
}

// Em produção os arquivos só mudam entre builds, então lemos o disco uma vez por
// processo. Em dev relemos sempre, senão criar ou editar um .md não aparece sem
// reiniciar o servidor.
let cache: Noticia[] | undefined;

export function getTodasNoticias(): Noticia[] {
  if (process.env.NODE_ENV !== "production") {
    return lerNoticias();
  }
  cache ??= lerNoticias();
  return cache;
}

export function getNoticiaPorSlug(slug: string): Noticia | undefined {
  return getTodasNoticias().find((noticia) => noticia.slug === slug);
}

export function getNoticiasPorCategoria(categoria: string): Noticia[] {
  return getTodasNoticias().filter((noticia) => noticia.categoria === categoria);
}

/** A mais recente marcada como destaque; se não houver nenhuma, a mais recente geral. */
export function getNoticiaDestaque(): Noticia | undefined {
  const todas = getTodasNoticias();
  return todas.find((noticia) => noticia.destaque) ?? todas[0];
}

function contarPaginas(noticias: Noticia[]): number {
  return Math.max(1, Math.ceil(noticias.length / NOTICIAS_POR_PAGINA));
}

function fatiarPagina(noticias: Noticia[], pagina: number): Noticia[] {
  const inicio = (pagina - 1) * NOTICIAS_POR_PAGINA;
  return noticias.slice(inicio, inicio + NOTICIAS_POR_PAGINA);
}

export function getTotalDePaginas(categoria: string): number {
  return contarPaginas(getNoticiasPorCategoria(categoria));
}

export function getNoticiasDaPagina(categoria: string, pagina: number): Noticia[] {
  return fatiarPagina(getNoticiasPorCategoria(categoria), pagina);
}

/** Mesma paginação, mas sobre o acervo inteiro — alimenta /noticias. */
export function getTotalDePaginasGeral(): number {
  return contarPaginas(getTodasNoticias());
}

export function getNoticiasDaPaginaGeral(pagina: number): Noticia[] {
  return fatiarPagina(getTodasNoticias(), pagina);
}

export function buscarCategoria(slug: string): Categoria | undefined {
  return categorias.find((categoria) => categoria.slug === slug);
}

export function rotuloDaCategoria(slug: string): string {
  return buscarCategoria(slug)?.rotulo ?? slug;
}

// Reexportado por conveniência de quem já importa daqui. Componente de cliente
// deve importar de `@/lib/datas`: este módulo lê disco.
export { formatarData } from "@/lib/datas";
