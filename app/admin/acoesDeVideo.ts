"use server";

import { temSessao } from "@/lib/admin/sessao";
import { caminhoExiste, commitarArquivos } from "@/lib/admin/github";
import {
  caminhoDoVideo,
  montarPublicacaoDoVideo,
  validarVideo,
  type DadosDoVideo,
} from "@/lib/admin/videos";
import { extrairVideoId } from "@/lib/youtube";

/**
 * Server Actions são endpoints POST públicos: quem descobrir o ID da action
 * consegue chamá-la sem nunca ter visto a tela. Por isso toda ação começa
 * conferindo a sessão, mesmo com o `proxy.ts` na frente.
 */

export type EstadoDoVideo = {
  erros: string[];
  sucesso?: {
    slug: string;
    caminho: string;
    urlDoCommit: string;
  };
};

export type EstadoDaExclusaoDeVideo = {
  erro?: string;
  sucesso?: { slug: string; caminho: string; urlDoCommit: string };
};

/** Dados que o YouTube devolve sobre um vídeo, para preencher o formulário. */
export type DadosDoYouTube = {
  erro?: string;
  title?: string;
  canal?: string;
  duracao?: string;
  publicadoEm?: string;
};

function listaDeTexto(valor: string): string[] {
  return valor
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** "451" -> "7:31". Acima de uma hora, "1:02:03". */
function formatarDuracao(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  const doisDigitos = (numero: number) => String(numero).padStart(2, "0");

  return h > 0
    ? `${h}:${doisDigitos(m)}:${doisDigitos(s)}`
    : `${m}:${doisDigitos(s)}`;
}

/**
 * Busca título, canal, duração e data de publicação a partir da URL colada.
 *
 * Título e canal vêm do oEmbed, que é uma API pública e documentada do YouTube.
 * Duração e data não existem lá, então saem da própria página do vídeo — o que é
 * frágil por natureza, porque depende do HTML deles. Por isso cada campo é
 * opcional no retorno: falhar em achar a duração não pode impedir o editor de
 * cadastrar o vídeo, só o deixa digitando esse campo à mão.
 */
export async function buscarDadosDoYouTube(
  url: string
): Promise<DadosDoYouTube> {
  if (!(await temSessao())) {
    return { erro: "Sessão expirada. Recarregue a página e entre de novo." };
  }

  const identificado = extrairVideoId(url);
  if (!identificado) {
    return { erro: "Não reconheci um vídeo do YouTube nessa URL." };
  }

  const paginaDoVideo = `https://www.youtube.com/watch?v=${identificado.id}`;

  try {
    const oembed = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(paginaDoVideo)}&format=json`,
      { cache: "no-store" }
    );

    if (!oembed.ok) {
      return {
        erro:
          oembed.status === 404
            ? "O YouTube não encontrou esse vídeo. Ele pode ser privado ou ter sido removido."
            : `O YouTube respondeu ${oembed.status} ao consultar o vídeo.`,
      };
    }

    const dados = (await oembed.json()) as {
      title?: string;
      author_name?: string;
    };

    const encontrado: DadosDoYouTube = {
      title: dados.title,
      canal: dados.author_name,
    };

    // Melhor esforço, num try próprio: se a raspagem quebrar, o que o oEmbed já
    // devolveu continua valendo.
    try {
      const pagina = await fetch(paginaDoVideo, { cache: "no-store" });
      const html = await pagina.text();

      const segundos = /"lengthSeconds":"(\d+)"/.exec(html)?.[1];
      if (segundos) encontrado.duracao = formatarDuracao(Number(segundos));

      const data = /"uploadDate":"(\d{4}-\d{2}-\d{2})/.exec(html)?.[1];
      if (data) encontrado.publicadoEm = data;
    } catch {
      // Sem duração e sem data; o editor preenche.
    }

    return encontrado;
  } catch (erro) {
    return {
      erro:
        erro instanceof Error
          ? `Falha ao consultar o YouTube: ${erro.message}`
          : "Falha ao consultar o YouTube.",
    };
  }
}

export async function publicarVideo(
  _anterior: EstadoDoVideo,
  formData: FormData
): Promise<EstadoDoVideo> {
  if (!(await temSessao())) {
    return { erros: ["Sessão expirada. Recarregue a página e entre de novo."] };
  }

  const dados: DadosDoVideo = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    url: String(formData.get("url") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    canal: String(formData.get("canal") ?? ""),
    duracao: String(formData.get("duracao") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    publicadoEm: String(formData.get("publicadoEm") ?? ""),
    organizacoes: formData.getAll("organizacoes").map(String),
    tags: listaDeTexto(String(formData.get("tags") ?? "")),
    destaque: formData.get("destaque") === "on",
  };

  const erros = validarVideo(dados);
  if (erros.length > 0) {
    return { erros };
  }

  const publicacao = montarPublicacaoDoVideo(dados);

  try {
    // O painel só cria: gravar por cima apagaria o cadastro anterior sem aviso.
    if (await caminhoExiste(publicacao.caminho)) {
      return {
        erros: [
          `Já existe um vídeo em ${publicacao.caminho}. Mude o slug ou exclua o cadastro antigo.`,
        ],
      };
    }

    const commit = await commitarArquivos(
      publicacao.mensagemDoCommit,
      publicacao.arquivos
    );

    return {
      erros: [],
      sucesso: {
        slug: publicacao.slug,
        caminho: publicacao.caminho,
        urlDoCommit: commit.url,
      },
    };
  } catch (erro) {
    return {
      erros: [
        erro instanceof Error
          ? `Falha ao publicar no GitHub: ${erro.message}`
          : "Falha ao publicar no GitHub.",
      ],
    };
  }
}

export async function excluirVideo(
  _anterior: EstadoDaExclusaoDeVideo,
  formData: FormData
): Promise<EstadoDaExclusaoDeVideo> {
  if (!(await temSessao())) {
    return { erro: "Sessão expirada. Recarregue a página e entre de novo." };
  }

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) {
    return { erro: "Nenhum vídeo informado." };
  }

  try {
    const caminho = await caminhoDoVideo(slug);

    if (!caminho) {
      return {
        erro: `O vídeo "${slug}" não está mais no repositório. Ele pode já ter sido excluído.`,
      };
    }

    // Nenhum arquivo de imagem sai daqui: a miniatura é servida pelo YouTube.
    const commit = await commitarArquivos(`Fix: Remove o vídeo ${slug}`, [], [
      caminho,
    ]);

    return { sucesso: { slug, caminho, urlDoCommit: commit.url } };
  } catch (erro) {
    return {
      erro:
        erro instanceof Error
          ? `Falha ao excluir no GitHub: ${erro.message}`
          : "Falha ao excluir no GitHub.",
    };
  }
}
