"use server";

import { redirect } from "next/navigation";
import { abrirSessao, fecharSessao, senhaConfere, temSessao } from "@/lib/admin/sessao";
import { caminhoExiste, commitarArquivos } from "@/lib/admin/github";
import {
  montarPublicacao,
  validar,
  type DadosDaNoticia,
  type FonteInformada,
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
