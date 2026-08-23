"use server";

import { redirect } from "next/navigation";
import { abrirSessao, fecharSessao, senhaConfere, temSessao } from "@/lib/admin/sessao";
import { caminhoExiste, commitarArquivos } from "@/lib/admin/github";
import { carregarMateria } from "@/lib/admin/materias";
import {
  arquivosDaMateria,
  montarPublicacao,
  validar,
  type DadosDaNoticia,
  type Edicao,
  type FonteInformada,
  type ImagemDoCorpoInformada,
} from "@/lib/admin/publicacao";

/**
 * Server Actions são endpoints POST públicos: quem descobrir o ID da action
 * consegue chamá-la sem nunca ter visto a tela. Por isso toda ação que publica
 * começa conferindo a sessão, mesmo com o `proxy.ts` na frente.
 */

export type EstadoDoLogin = {
  erro?: string;
};

export type EstadoDaPublicacao = {
  erros: string[];
  sucesso?: {
    slug: string;
    caminho: string;
    urlDoCommit: string;
    /** Muda o aviso de sucesso: matéria criada agora ou atualizada. */
    editada: boolean;
  };
};

export type EstadoDaExclusao = {
  erro?: string;
  sucesso?: {
    slug: string;
    /** Todos os caminhos que saíram do repositório — o .md e as imagens dela. */
    caminhos: string[];
    urlDoCommit: string;
  };
};

export async function entrar(
  _anterior: EstadoDoLogin,
  formData: FormData
): Promise<EstadoDoLogin> {
  const senha = String(formData.get("senha") ?? "");

  if (!senha || !senhaConfere(senha)) {
    return { erro: "Senha incorreta." };
  }

  await abrirSessao();
  // `redirect` sinaliza por exceção — fora de qualquer try/catch, senão ele é
  // engolido e a navegação não acontece.
  redirect("/admin");
}

export async function sair(): Promise<void> {
  await fecharSessao();
  redirect("/admin/login");
}

function lerFontes(formData: FormData): FonteInformada[] {
  const rotulos = formData.getAll("fonteRotulo").map(String);
  const urls = formData.getAll("fonteUrl").map(String);

  return rotulos.map((rotulo, indice) => ({
    rotulo,
    url: urls[indice] ?? "",
  }));
}

async function lerImagem(
  formData: FormData
): Promise<DadosDaNoticia["imagem"]> {
  const arquivo = formData.get("imagem");

  // Input de arquivo vazio ainda chega como File, só que com 0 byte.
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return undefined;
  }

  return {
    nome: arquivo.name,
    bytes: Buffer.from(await arquivo.arrayBuffer()),
  };
}

/**
 * As fotos do meio do texto chegam em campos repetidos, um conjunto por linha do
 * formulário. A ordem é o que liga cada arquivo à sua legenda e ao marcador que
 * o editor deixou no corpo, então a linha sem arquivo é preservada aqui, com
 * bytes vazios: descartá-la deslocaria a numeração de todas as seguintes.
 * `validar` é quem reclama dela.
 */
async function lerImagensDoCorpo(
  formData: FormData
): Promise<ImagemDoCorpoInformada[]> {
  const arquivos = formData.getAll("imagemCorpo");
  const legendas = formData.getAll("imagemCorpoLegenda").map(String);
  const fontes = formData.getAll("imagemCorpoFonte").map(String);
  // Checkbox só é enviada quando marcada, então ela carrega o índice da linha em
  // vez de "on" — sem isso não daria para saber de qual imagem ela é.
  const geradasPorIA = new Set(formData.getAll("imagemCorpoIA").map(String));

  return Promise.all(
    arquivos.map(async (arquivo, indice) => ({
      nome: arquivo instanceof File ? arquivo.name : "",
      bytes:
        arquivo instanceof File
          ? Buffer.from(await arquivo.arrayBuffer())
          : Buffer.alloc(0),
      legenda: legendas[indice] ?? "",
      fonte: fontes[indice] ?? "",
      geradaPorIA: geradasPorIA.has(String(indice)),
    }))
  );
}

export async function publicarNoticia(
  _anterior: EstadoDaPublicacao,
  formData: FormData
): Promise<EstadoDaPublicacao> {
  if (!(await temSessao())) {
    return { erros: ["Sessão expirada. Recarregue a página e entre de novo."] };
  }

  const dados: DadosDaNoticia = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    date: String(formData.get("date") ?? ""),
    categoria: String(formData.get("categoria") ?? ""),
    resumo: String(formData.get("resumo") ?? ""),
    corpo: String(formData.get("corpo") ?? ""),
    destaque: formData.get("destaque") === "on",
    fontes: lerFontes(formData),
    imagem: await lerImagem(formData),
    imagemUrl: String(formData.get("imagemUrl") ?? ""),
    imagemPosicao: String(formData.get("imagemPosicao") ?? ""),
    imagemCredito: String(formData.get("imagemCredito") ?? ""),
    imagemFonte: String(formData.get("imagemFonte") ?? ""),
    imagemLicenca: String(formData.get("imagemLicenca") ?? ""),
    imagemGeradaPorIA: formData.get("imagemGeradaPorIA") === "on",
    imagensDoCorpo: await lerImagensDoCorpo(formData),
  };

  const erros = validar(dados);
  if (erros.length > 0) {
    return { erros };
  }

  /**
   * O formulário de edição manda o slug de origem num campo escondido. É ele que
   * diz se este envio é matéria nova ou correção de uma que já está no ar — e a
   * correção precisa do frontmatter original em mãos, senão a edição apagaria as
   * tags e as organizações, que o formulário não tem como preencher.
   */
  const slugOriginal = String(formData.get("slugOriginal") ?? "").trim();
  let edicao: Edicao | undefined;

  if (slugOriginal) {
    const original = await carregarMateria(slugOriginal);

    if (!original) {
      return {
        erros: [
          `A matéria "${slugOriginal}" não está mais no repositório. Ela pode ter sido excluída em outra aba.`,
        ],
      };
    }

    edicao = {
      frontmatterOriginal: original.frontmatter,
      caminhoAnterior: original.caminho,
    };
  }

  const publicacao = montarPublicacao(dados, edicao);

  try {
    // Gravar por cima de uma matéria existente apagaria o texto anterior sem
    // aviso. Na edição isso é o objetivo, mas só do arquivo dela: mudar o slug
    // para o de outra matéria continua barrado.
    const gravaNoProprioArquivo =
      edicao?.caminhoAnterior === publicacao.caminhoDoMarkdown;

    if (
      !gravaNoProprioArquivo &&
      (await caminhoExiste(publicacao.caminhoDoMarkdown))
    ) {
      return {
        erros: [
          `Já existe uma matéria em ${publicacao.caminhoDoMarkdown}. Mude o slug ou a data.`,
        ],
      };
    }

    // O commit é montado com `base_tree`: caminho repetido grava em cima do que
    // estava lá, sem conflito nem aviso. Duas matérias de slug parecido podem
    // colidir aqui, e o prejuízo seria a foto da matéria antiga.
    const ocupados = (
      await Promise.all(
        publicacao.caminhosDasImagensDoCorpo.map(async (caminho) =>
          (await caminhoExiste(caminho)) ? caminho : null
        )
      )
    ).filter((caminho): caminho is string => caminho !== null);

    if (ocupados.length > 0) {
      return {
        erros: [
          `Já existe arquivo em ${ocupados.join(", ")}. Mude o slug para não apagar a imagem de outra matéria.`,
        ],
      };
    }

    const commit = await commitarArquivos(
      publicacao.mensagemDoCommit,
      publicacao.arquivos,
      publicacao.caminhosApagados
    );

    return {
      erros: [],
      sucesso: {
        slug: publicacao.slug,
        caminho: publicacao.caminhoDoMarkdown,
        urlDoCommit: commit.url,
        editada: Boolean(edicao),
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

/**
 * Tira a matéria do ar: apaga o .md e as imagens que são dela, num commit só.
 *
 * A URL vira 404 depois do deploy — quem tinha o link perde a página, e o Google
 * também. A tela confirma antes, e o commit fica no histórico, então nada aqui é
 * irreversível de verdade: reverter o commit traz a matéria de volta inteira.
 */
export async function excluirNoticia(
  _anterior: EstadoDaExclusao,
  formData: FormData
): Promise<EstadoDaExclusao> {
  if (!(await temSessao())) {
    return { erro: "Sessão expirada. Recarregue a página e entre de novo." };
  }

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) {
    return { erro: "Nenhuma matéria informada." };
  }

  try {
    const materia = await carregarMateria(slug);

    if (!materia) {
      return {
        erro: `A matéria "${slug}" não está mais no repositório. Ela pode já ter sido excluída.`,
      };
    }

    const caminhos = arquivosDaMateria(
      materia.caminho,
      materia.frontmatter,
      materia.corpo,
      slug
    );

    const titulo =
      typeof materia.frontmatter.title === "string"
        ? materia.frontmatter.title
        : slug;

    const commit = await commitarArquivos(
      `Fix: Remove a matéria ${titulo}`,
      [],
      caminhos
    );

    return { sucesso: { slug, caminhos, urlDoCommit: commit.url } };
  } catch (erro) {
    return {
      erro:
        erro instanceof Error
          ? `Falha ao excluir no GitHub: ${erro.message}`
          : "Falha ao excluir no GitHub.",
    };
  }
}
