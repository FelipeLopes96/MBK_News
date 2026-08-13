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
  /**
   * Organizações às quais o conteúdo se refere (slugs de content/organizacoes).
   * É o que faz o artigo aparecer no hub da organização.
   */
  organizacoes: string[];
  /** Corpo do arquivo .md, ainda em Markdown. */
  conteudo: string;
};

export type CategoriaDeConteudo = {
  slug: string;
  rotulo: string;
};

/**
 * Parte da foto que deve sobreviver ao corte. As capas são exibidas em 16:9 com
 * `object-cover`: numa foto vertical ou quadrada, o corte central come o topo e
 * é comum decepar a cabeça do retratado — `topo` resolve esse caso.
 */
export type PosicaoDaImagem =
  | "centro"
  | "topo"
  | "base"
  | "esquerda"
  | "direita";

const POSICOES: PosicaoDaImagem[] = [
  "centro",
  "topo",
  "base",
  "esquerda",
  "direita",
];

/** Imagem com os dados de atribuição exigidos na publicação. */
export type ImagemComCredito = {
  url: string;
  /** Enquadramento do corte. Ausente, o corte é centralizado. */
  posicao?: PosicaoDaImagem;
  /** Quem fez a foto (fotógrafo ou agência). */
  credito?: string;
  /** Onde a imagem foi obtida (veículo, site oficial, banco de imagens). */
  fonte?: string;
  /** Termos de uso — ex.: "Getty Images", "CC BY 2.0", "Divulgação". */
  licenca?: string;
};

/**
 * Dado que não pode ser publicado como número oficial porque a única fonte é
 * quem o afirma — o cartel declarado pelo atleta, a data que ele mesmo estima.
 * A `qualificacao` acompanha o valor onde ele aparecer: é o que separa o dado
 * apurado do dado atribuído.
 */
export type ValorQualificado = {
  valor: string;
  /** Atribuição exibida junto do valor — ex.: "segundo o próprio atleta". */
  qualificacao?: string;
};

/** Veículo consultado na apuração. Vira link quando tem `url`. */
export type Fonte = {
  rotulo: string;
  url?: string;
  /** Natureza da fonte — ex.: "oficial", "imprensa". */
  tipo?: string;
};

/** O YAML converte datas sem aspas em Date; normalizamos para string ISO. */
export function normalizarData(valor: unknown): string {
  if (valor instanceof Date) {
    return valor.toISOString().slice(0, 10);
  }
  return String(valor ?? "");
}

/** Campo opcional de texto: só vira valor quando tem conteúdo de verdade. */
export function textoOpcional(valor: unknown): string | undefined {
  const texto = String(valor ?? "").trim();
  return texto || undefined;
}

/** Lista de strings tolerante a valor único e a itens vazios. */
export function normalizarLista(valor: unknown): string[] {
  const lista = Array.isArray(valor) ? valor : [valor];
  return lista
    .map((item) => String(item ?? "").trim())
    .filter((item) => item.length > 0);
}

/**
 * Aceita a string simples — quando o dado dispensa atribuição — ou o objeto
 * { valor, qualificacao } quando ele só pode ser publicado atribuído.
 */
export function normalizarValorQualificado(
  valor: unknown
): ValorQualificado | undefined {
  if (typeof valor === "string" || typeof valor === "number") {
    const texto = textoOpcional(valor);
    return texto ? { valor: texto } : undefined;
  }

  if (valor && typeof valor === "object") {
    const campos = valor as Record<string, unknown>;
    const texto = textoOpcional(campos.valor ?? campos.display ?? campos.texto);
    if (!texto) {
      return undefined;
    }

    return {
      valor: texto,
      qualificacao: textoOpcional(campos.qualificacao ?? campos.qualification),
    };
  }

  return undefined;
}

/**
 * `imagem` aceita duas formas no frontmatter: a string simples usada nos
 * conteúdos antigos e o objeto com atribuição — url, credito, fonte, licenca.
 */
export function normalizarImagem(valor: unknown): ImagemComCredito | undefined {
  if (typeof valor === "string") {
    const url = valor.trim();
    return url ? { url } : undefined;
  }

  if (valor && typeof valor === "object") {
    const campos = valor as Record<string, unknown>;
    const url = textoOpcional(campos.url);
    if (!url) {
      return undefined;
    }

    const posicao = textoOpcional(campos.posicao);

    return {
      url,
      posicao: POSICOES.find((valida) => valida === posicao),
      credito: textoOpcional(campos.credito),
      fonte: textoOpcional(campos.fonte),
      licenca: textoOpcional(campos.licenca),
    };
  }

  return undefined;
}

/**
 * `fontes` aceita nomes soltos — "UFC" — ou objetos { rotulo, url } quando a
 * fonte tem link. Também aceita uma URL crua, que vira rótulo e link.
 */
export function normalizarFontes(valor: unknown): Fonte[] {
  const lista = Array.isArray(valor) ? valor : [valor];

  return lista.flatMap((item): Fonte[] => {
    if (typeof item === "string") {
      const texto = item.trim();
      if (!texto) return [];
      return [/^https?:\/\//.test(texto) ? { rotulo: texto, url: texto } : { rotulo: texto }];
    }

    if (item && typeof item === "object") {
      const campos = item as Record<string, unknown>;
      const url = textoOpcional(campos.url);
      const rotulo =
        textoOpcional(campos.rotulo) ??
        textoOpcional(campos.nome) ??
        textoOpcional(campos.name) ??
        url;
      if (!rotulo) return [];
      return [{ rotulo, url, tipo: textoOpcional(campos.tipo ?? campos.type) }];
    }

    return [];
  });
}

/**
 * Organizações relacionadas. Aceita `organizacoes`, `organizations` e
 * `organization` porque as três formas aparecem nos conteúdos.
 */
export function normalizarOrganizacoes(data: Record<string, unknown>): string[] {
  return normalizarLista(
    data.organizacoes ?? data.organizations ?? data.organization
  );
}

/** Slug derivado do nome do arquivo, sem o prefixo de data. */
export function slugDoArquivo(arquivo: string): string {
  return arquivo.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(/\.md$/, "");
}

export type ArquivoBruto = {
  /** Nome do arquivo no disco, ex.: "2026-05-28-muay-thai-vs-kickboxing.md". */
  arquivo: string;
  data: Record<string, unknown>;
  conteudo: string;
};

function lerBrutos(pasta: string): ArquivoBruto[] {
  const diretorio = path.join(process.cwd(), "content", pasta);

  if (!fs.existsSync(diretorio)) {
    return [];
  }

  return fs
    .readdirSync(diretorio)
    .filter((arquivo) => arquivo.endsWith(".md"))
    .map((arquivo) => {
      const bruto = fs.readFileSync(path.join(diretorio, arquivo), "utf8");
      const { data, content } = matter(bruto);

      return {
        arquivo,
        data: data as Record<string, unknown>,
        conteudo: content.trim(),
      };
    });
}

// Em produção lemos o disco uma vez por processo; em dev relemos sempre, senão
// criar ou editar um .md não aparece sem reiniciar o servidor.
const cache = new Map<string, ArquivoBruto[]>();

/**
 * Frontmatter + corpo de todos os .md de uma pasta de `content/`, sem impor
 * formato. É a base tanto dos artigos quanto das entidades do Arquivo.
 */
export function carregarBrutos(pasta: string): ArquivoBruto[] {
  if (process.env.NODE_ENV !== "production") {
    return lerBrutos(pasta);
  }

  let itens = cache.get(pasta);
  if (!itens) {
    itens = lerBrutos(pasta);
    cache.set(pasta, itens);
  }
  return itens;
}

export function carregarConteudo(pasta: string): ItemDeConteudo[] {
  const itens = carregarBrutos(pasta).map(({ arquivo, data, conteudo }) => {
    return {
      title: String(data.title ?? ""),
      slug: String(data.slug ?? slugDoArquivo(arquivo)),
      date: normalizarData(data.date),
      categoria: String(data.categoria ?? ""),
      resumo: String(data.resumo ?? ""),
      // Aqui só a URL interessa, mas normalizamos igual para o caso de um
      // artigo trazer o objeto com crédito em vez da string simples.
      imagem: normalizarImagem(data.imagem)?.url,
      organizacoes: normalizarOrganizacoes(data),
      conteudo,
    } satisfies ItemDeConteudo;
  });

  // Mais recentes primeiro.
  return itens.sort((a, b) => b.date.localeCompare(a.date));
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
