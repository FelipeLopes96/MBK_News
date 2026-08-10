import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Base compartilhada pelas seções Arquivo e Arsenal: mesmo frontmatter,
 * sem o campo `destaque` que só existe nas notícias.
 */
export type ItemDeConteudo = {
  title: string;
  slug: string;
  /** Data em formato ISO (AAAA-MM-DD). */
  date: string;
  categoria: string;
  resumo: string;
  imagem?: string;
  /** Corpo do arquivo .md, ainda em Markdown. */
  conteudo: string;
};

export type CategoriaDeConteudo = {
  slug: string;
  rotulo: string;
};

/** O YAML converte datas sem aspas em Date; normalizamos para string ISO. */
function normalizarData(valor: unknown): string {
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }
  return String(valor ?? "");
}

function lerPasta(pasta: string): ItemDeConteudo[] {
  const diretorio = path.join(process.cwd(), "content", pasta);

  if (!fs.existsSync(diretorio)) {
    return [];
  }

  const itens = fs
    .readdirSync(diretorio)
    .filter((arquivo) => arquivo.endsWith(".md"))
    .map((arquivo) => {
      const bruto = fs.readFileSync(path.join(diretorio, arquivo), "utf8");
      const { data, content } = matter(bruto);

      return {
        title: String(data.title ?? ""),
        slug: String(
          data.slug ??
            arquivo.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "")
        ),
        date: normalizarData(data.date),
        categoria: String(data.categoria ?? ""),
        resumo: String(data.resumo ?? ""),
        imagem: data.imagem ? String(data.imagem) : undefined,
        conteudo: content.trim(),
      } satisfies ItemDeConteudo;
    });

  // Mais recentes primeiro.
  return itens.sort((a, b) => b.date.localeCompare(a.date));
}

// Em produção lemos o disco uma vez por processo; em dev relemos sempre, senão
// criar ou editar um .md não aparece sem reiniciar o servidor.
const cache = new Map<string, ItemDeConteudo[]>();

export function carregarConteudo(pasta: string): ItemDeConteudo[] {
  if (process.env.NODE_ENV !== "production") {
    return lerPasta(pasta);
  }

  let itens = cache.get(pasta);
  if (!itens) {
    itens = lerPasta(pasta);
    cache.set(pasta, itens);
  }
  return itens;
}

export function rotuloDe(
  categorias: CategoriaDeConteudo[],
  slug: string
): string {
  return categorias.find((categoria) => categoria.slug === slug)?.rotulo ?? slug;
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
