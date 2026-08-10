import {
  carregarConteudo,
  rotuloDe,
  type CategoriaDeConteudo,
  type ItemDeConteudo,
} from "@/lib/conteudo";

export type Review = ItemDeConteudo;

export const categoriasDoArsenal: CategoriaDeConteudo[] = [
  { slug: "luvas", rotulo: "Luvas" },
  { slug: "caneleiras", rotulo: "Caneleiras" },
  { slug: "shorts", rotulo: "Shorts" },
  { slug: "protecao", rotulo: "Proteção" },
  { slug: "acessorios", rotulo: "Acessórios" },
];

export function getTodos(): Review[] {
  return carregarConteudo("arsenal");
}

export function getPorSlug(slug: string): Review | undefined {
  return getTodos().find((review) => review.slug === slug);
}

export function getPorCategoria(categoria: string): Review[] {
  return getTodos().filter((review) => review.categoria === categoria);
}

export function rotuloDaCategoria(slug: string): string {
  return rotuloDe(categoriasDoArsenal, slug);
}
