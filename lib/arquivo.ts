import {
  carregarConteudo,
  rotuloDe,
  type CategoriaDeConteudo,
  type ItemDeConteudo,
} from "@/lib/conteudo";

export type Artigo = ItemDeConteudo;

export const categoriasDoArquivo: CategoriaDeConteudo[] = [
  { slug: "historia", rotulo: "História" },
  { slug: "guia", rotulo: "Guia" },
  { slug: "explicacao", rotulo: "Explicação" },
];

export function getTodos(): Artigo[] {
  return carregarConteudo("arquivo");
}

export function getPorSlug(slug: string): Artigo | undefined {
  return getTodos().find((artigo) => artigo.slug === slug);
}

export function getPorCategoria(categoria: string): Artigo[] {
  return getTodos().filter((artigo) => artigo.categoria === categoria);
}

export function rotuloDaCategoria(slug: string): string {
  return rotuloDe(categoriasDoArquivo, slug);
}
