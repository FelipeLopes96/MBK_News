import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  normalizarData,
  normalizarFontes,
  normalizarImagem,
  type Fonte,
  type ImagemComCredito,
} from "@/lib/conteudo";

/** Imagem de capa com os dados de atribuição exigidos na publicação. */
export type ImagemDeNoticia = ImagemComCredito;

export type Noticia = {
  title: string;
  slug: string;
  /** Data em formato ISO (AAAA-MM-DD). */
  date: string;
  categoria: string;
  resumo: string;
  imagem?: ImagemDeNoticia;
  /** Veículos consultados na apuração, exibidos no fim da matéria. */
  fontes: Fonte[];
  destaque: boolean;
  /** Corpo do arquivo .md, ainda em Markdown. */
  conteudo: string;
};

export type Categoria = {
  slug: string;
  rotulo: string;
};

/** Fonte única de verdade das categorias — usada pelo Header, pelo Footer e pela rota /[categoria]. */
export const categorias: Categoria[] = [
  { slug: "mma", rotulo: "MMA" },
  { slug: "boxe", rotulo: "Boxe" },
  { slug: "jiu-jitsu", rotulo: "Jiu-Jitsu" },
  { slug: "muay-thai", rotulo: "Muay Thai" },
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
      slug: String(data.slug ?? arquivo.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "")),
      date: normalizarData(data.date),
      categoria: String(data.categoria ?? ""),
      resumo: String(data.resumo ?? ""),
      imagem: normalizarImagem(data.imagem),
      fontes: normalizarFontes(data.fontes),
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

export function getTotalDePaginas(categoria: string): number {
  const total = getNoticiasPorCategoria(categoria).length;
  return Math.max(1, Math.ceil(total / NOTICIAS_POR_PAGINA));
}

export function getNoticiasDaPagina(categoria: string, pagina: number): Noticia[] {
  const inicio = (pagina - 1) * NOTICIAS_POR_PAGINA;
  return getNoticiasPorCategoria(categoria).slice(
    inicio,
    inicio + NOTICIAS_POR_PAGINA
  );
}

export function buscarCategoria(slug: string): Categoria | undefined {
  return categorias.find((categoria) => categoria.slug === slug);
}

export function rotuloDaCategoria(slug: string): string {
  return buscarCategoria(slug)?.rotulo ?? slug;
}

const formatadorDeData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatarData(data: string): string {
  return formatadorDeData.format(new Date(data));
}
