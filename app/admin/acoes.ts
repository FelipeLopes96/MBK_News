"use server";

import { redirect } from "next/navigation";
import { abrirSessao, fecharSessao, senhaConfere, temSessao } from "@/lib/admin/sessao";
import { caminhoExiste, commitarArquivos } from "@/lib/admin/github";
import {
  montarPublicacao,
  validar,
  type DadosDaNoticia,
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

  const publicacao = montarPublicacao(dados);

  try {
    // Publicar por cima de uma matéria existente apagaria o texto anterior sem
    // aviso; o painel só cria.
    if (await caminhoExiste(publicacao.caminhoDoMarkdown)) {
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
      publicacao.arquivos
    );

    return {
      erros: [],
      sucesso: {
        slug: publicacao.slug,
        caminho: publicacao.caminhoDoMarkdown,
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
