import matter from "gray-matter";
import { lerArquivo, listarArquivos } from "@/lib/admin/github";
import { getTodasNoticias } from "@/lib/noticias";

/**
 * O que o painel precisa saber sobre as matérias já publicadas, para listar,
 * editar e excluir.
 *
 * A lista de arquivos vem do GitHub, e não do disco, porque o disco do servidor
 * é o do último deploy: uma matéria publicada há trinta segundos ainda não está
 * lá. Sumir da lista logo depois de publicar faria o editor publicar de novo.
 *
 * O título e a categoria, esses vêm do disco, onde já estão lidos e
 * normalizados — buscar 23 arquivos no GitHub só para montar uma lista custaria
 * 23 chamadas. Quando a matéria é nova demais para estar no disco, a lista
 * mostra o que dá para tirar do nome do arquivo e avisa que falta o deploy.
 */

export const DIRETORIO = "content/noticias";

export type MateriaNaLista = {
  slug: string;
  date: string;
  title: string;
  categoria: string;
  destaque: boolean;
  /** Está no repositório, mas ainda não no deploy que serve esta página. */
  aguardandoDeploy: boolean;
};

export type MateriaCarregada = {
  slug: string;
  caminho: string;
  frontmatter: Record<string, unknown>;
  corpo: string;
};

/** "2026-08-23-petrino-nocauteia.md" -> { date, slug } */
function partesDoNome(arquivo: string): { date: string; slug: string } | undefined {
  const achado = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/.exec(arquivo);
  return achado ? { date: achado[1], slug: achado[2] } : undefined;
}

export async function listarMaterias(): Promise<MateriaNaLista[]> {
  const arquivos = await listarArquivos(DIRETORIO);

  const noDisco = new Map(
    getTodasNoticias().map((noticia) => [noticia.slug, noticia])
  );

  return arquivos
    .map(partesDoNome)
    .filter((partes): partes is { date: string; slug: string } => partes !== undefined)
    .map(({ date, slug }) => {
      const noticia = noDisco.get(slug);

      return {
        slug,
        date,
        // Sem o deploy ainda, o slug é o que há: já é legível o bastante para o
        // editor reconhecer a matéria que acabou de publicar.
        title: noticia?.title ?? slug,
        categoria: noticia?.categoria ?? "",
        destaque: noticia?.destaque ?? false,
        aguardandoDeploy: noticia === undefined,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Uma matéria como está no repositório agora.
 *
 * Vem do GitHub de propósito: editar a cópia do último deploy e commitar por
 * cima desfaria, em silêncio, qualquer alteração feita depois dele.
 */
export async function carregarMateria(
  slug: string
): Promise<MateriaCarregada | undefined> {
  const arquivos = await listarArquivos(DIRETORIO);
  const arquivo = arquivos.find((nome) => partesDoNome(nome)?.slug === slug);

  if (!arquivo) return undefined;

  const caminho = `${DIRETORIO}/${arquivo}`;
  const bruto = await lerArquivo(caminho);

  if (bruto === undefined) return undefined;

  const { data, content } = matter(bruto);

  return {
    slug,
    caminho,
    frontmatter: data as Record<string, unknown>,
    corpo: content.trim(),
  };
}
