import matter from "gray-matter";
import { categorias } from "@/lib/noticias";
import { getOrganizacoes } from "@/lib/entidades";
import type { ArquivoParaCommit } from "@/lib/admin/github";
import { lerArquivo, listarArquivos } from "@/lib/admin/github";
import { gerarSlug } from "@/lib/admin/slug";
import { extrairVideoId } from "@/lib/youtube";

/**
 * Traduz o que o formulário de vídeo envia para o `.md` que `lib/videos.ts` lê.
 *
 * Nenhum vídeo é hospedado aqui: o que se grava é a URL e os dados do card. O id
 * do YouTube não entra no arquivo — ele é extraído da URL na leitura, para não
 * haver duas versões da mesma informação podendo divergir.
 */

export const DIRETORIO_DE_VIDEOS = "content/videos";

/**
 * Slugs que a biblioteca usa como segmento de rota. Um vídeo com um desses
 * nomes ficaria inalcançável: /videos/pagina é a paginação, não um vídeo.
 */
const SLUGS_RESERVADOS = ["pagina", "modalidade"];

export type DadosDoVideo = {
  title: string;
  slug: string;
  url: string;
  descricao: string;
  canal: string;
  duracao: string;
  categoria: string;
  publicadoEm: string;
  organizacoes: string[];
  tags: string[];
  destaque: boolean;
};

export type PublicacaoDoVideo = {
  slug: string;
  caminho: string;
  arquivos: ArquivoParaCommit[];
  mensagemDoCommit: string;
};

export function validarVideo(dados: DadosDoVideo): string[] {
  const erros: string[] = [];

  if (!dados.title.trim()) erros.push("O título é obrigatório.");

  if (!dados.url.trim()) {
    erros.push("A URL do vídeo é obrigatória.");
  } else if (!extrairVideoId(dados.url)) {
    erros.push(
      "Não reconheci um vídeo do YouTube nessa URL. Cole o endereço da página do vídeo, do youtu.be ou do Shorts."
    );
  }

  if (!categorias.some((categoria) => categoria.slug === dados.categoria)) {
    erros.push("Escolha uma modalidade válida.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.publicadoEm)) {
    erros.push("A data de publicação precisa estar no formato AAAA-MM-DD.");
  }

  const slug = gerarSlug(dados.slug || dados.title);
  if (!slug) {
    erros.push("Não foi possível gerar um slug a partir do título.");
  } else if (SLUGS_RESERVADOS.includes(slug)) {
    erros.push(
      `"${slug}" é um endereço usado pela própria biblioteca. Mude o slug.`
    );
  }

  const conhecidas = new Set(
    getOrganizacoes().map((organizacao) => organizacao.slug)
  );
  for (const informada of dados.organizacoes) {
    if (!conhecidas.has(informada)) {
      erros.push(`A organização "${informada}" não existe no Arquivo.`);
    }
  }

  return erros;
}

export function montarPublicacaoDoVideo(
  dados: DadosDoVideo
): PublicacaoDoVideo {
  const slug = gerarSlug(dados.slug || dados.title);

  /**
   * Só os campos preenchidos entram no frontmatter. Chave vazia no `.md` é pior
   * que chave ausente: `lib/videos.ts` trata ausente como "não informado", e uma
   * string vazia viraria um crédito em branco no card.
   */
  const frontmatter = {
    title: dados.title.trim(),
    slug,
    ...(dados.descricao.trim() ? { descricao: dados.descricao.trim() } : {}),
    url: dados.url.trim(),
    ...(dados.canal.trim() ? { canal: dados.canal.trim() } : {}),
    ...(dados.duracao.trim() ? { duracao: dados.duracao.trim() } : {}),
    categoria: dados.categoria,
    ...(dados.organizacoes.length ? { organizacoes: dados.organizacoes } : {}),
    ...(dados.tags.length ? { tags: dados.tags } : {}),
    publicadoEm: dados.publicadoEm,
    destaque: dados.destaque,
  };

  const caminho = `${DIRETORIO_DE_VIDEOS}/${slug}.md`;
  // Corpo vazio: o texto de apoio é opcional e o formulário não o pede.
  const markdown = matter.stringify("", frontmatter);

  return {
    slug,
    caminho,
    arquivos: [{ caminho, conteudo: Buffer.from(markdown, "utf8") }],
    mensagemDoCommit: `Feat: Vídeo ${dados.title.trim()}`,
  };
}

export type VideoNoPainel = {
  slug: string;
  title: string;
  categoria: string;
  publicadoEm: string;
  destaque: boolean;
  /** No repositório, mas ainda não no deploy que serve esta página. */
  aguardandoDeploy: boolean;
};

/**
 * Os vídeos como estão no repositório.
 *
 * Mesma razão da lista de matérias: o disco do servidor é o do último deploy, e
 * um vídeo cadastrado agora não estaria lá. Aqui, porém, o `.md` é pequeno e sem
 * corpo, então lemos cada um — é o que dá para mostrar título e modalidade de
 * quem ainda não foi publicado.
 */
export async function listarVideosDoRepositorio(): Promise<VideoNoPainel[]> {
  const arquivos = (await listarArquivos(DIRETORIO_DE_VIDEOS)).filter((nome) =>
    nome.endsWith(".md")
  );

  const videos = await Promise.all(
    arquivos.map(async (arquivo) => {
      const bruto = await lerArquivo(`${DIRETORIO_DE_VIDEOS}/${arquivo}`);
      const dados = bruto ? (matter(bruto).data as Record<string, unknown>) : {};
      const slug = arquivo.replace(/\.md$/, "");

      return {
        slug: typeof dados.slug === "string" ? dados.slug : slug,
        title: typeof dados.title === "string" ? dados.title : slug,
        categoria: typeof dados.categoria === "string" ? dados.categoria : "",
        publicadoEm:
          typeof dados.publicadoEm === "string" ? dados.publicadoEm : "",
        destaque: dados.destaque === true,
        aguardandoDeploy: false,
      } satisfies VideoNoPainel;
    })
  );

  return videos.sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm));
}

/** O caminho do `.md` de um vídeo, para a exclusão. */
export async function caminhoDoVideo(slug: string): Promise<string | undefined> {
  const arquivos = await listarArquivos(DIRETORIO_DE_VIDEOS);
  const arquivo = arquivos.find((nome) => nome === `${slug}.md`);
  return arquivo ? `${DIRETORIO_DE_VIDEOS}/${arquivo}` : undefined;
}
