"use server";

import { temSessao } from "@/lib/admin/sessao";
import { commitarArquivos } from "@/lib/admin/github";
import {
  lerAgenda,
  montarExclusao,
  montarInclusao,
  validarEvento,
  type DadosDoEvento,
} from "@/lib/admin/eventos";

/**
 * Server Actions são endpoints POST públicos: quem descobrir o ID da action
 * consegue chamá-la sem nunca ter visto a tela. Daí a conferência de sessão em
 * todas, mesmo com o `proxy.ts` na frente.
 */

export type EstadoDoEvento = {
  erros: string[];
  sucesso?: { nome: string; data: string; urlDoCommit: string };
};

export type EstadoDaExclusaoDeEvento = {
  erro?: string;
  sucesso?: { id: number; urlDoCommit: string };
};

export async function adicionarEvento(
  _anterior: EstadoDoEvento,
  formData: FormData
): Promise<EstadoDoEvento> {
  if (!(await temSessao())) {
    return { erros: ["Sessão expirada. Recarregue a página e entre de novo."] };
  }

  const dados: DadosDoEvento = {
    organizacao: String(formData.get("organizacao") ?? ""),
    nome: String(formData.get("nome") ?? ""),
    data: String(formData.get("data") ?? ""),
    hora: String(formData.get("hora") ?? ""),
    local: String(formData.get("local") ?? ""),
    cidade: String(formData.get("cidade") ?? ""),
    status: String(formData.get("status") ?? "confirmado"),
  };

  const erros = validarEvento(dados);
  if (erros.length > 0) {
    return { erros };
  }

  try {
    // Ler agora, e não antes de validar: entre a abertura da tela e o envio
    // alguém pode ter cadastrado outro evento, e é a agenda atual que recebe
    // esta entrada.
    const agenda = await lerAgenda();
    const { arquivo, evento } = montarInclusao(agenda, dados);

    const commit = await commitarArquivos(
      `Feat: Agenda — ${evento.organizacao} ${evento.nome}`,
      [arquivo]
    );

    return {
      erros: [],
      sucesso: {
        nome: evento.nome,
        data: evento.data,
        urlDoCommit: commit.url,
      },
    };
  } catch (erro) {
    return {
      erros: [
        erro instanceof Error
          ? `Falha ao gravar a agenda no GitHub: ${erro.message}`
          : "Falha ao gravar a agenda no GitHub.",
      ],
    };
  }
}

export async function excluirEvento(
  _anterior: EstadoDaExclusaoDeEvento,
  formData: FormData
): Promise<EstadoDaExclusaoDeEvento> {
  if (!(await temSessao())) {
    return { erro: "Sessão expirada. Recarregue a página e entre de novo." };
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return { erro: "Nenhum evento informado." };
  }

  try {
    const agenda = await lerAgenda();
    const arquivo = montarExclusao(agenda, id);

    if (!arquivo) {
      return {
        erro: "Esse evento não está mais na agenda. Ele pode já ter sido excluído.",
      };
    }

    const commit = await commitarArquivos(`Fix: Agenda — remove evento ${id}`, [
      arquivo,
    ]);

    return { sucesso: { id, urlDoCommit: commit.url } };
  } catch (erro) {
    return {
      erro:
        erro instanceof Error
          ? `Falha ao gravar a agenda no GitHub: ${erro.message}`
          : "Falha ao gravar a agenda no GitHub.",
    };
  }
}
