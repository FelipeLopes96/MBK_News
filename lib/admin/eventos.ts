import type { ArquivoParaCommit } from "@/lib/admin/github";
import { lerArquivo } from "@/lib/admin/github";
import type { Evento, StatusDoEvento } from "@/lib/eventos";

/**
 * A agenda é um JSON, e não uma pasta de `.md` como o resto do acervo.
 *
 * Isso muda o jeito de gravar: matéria e vídeo são arquivo novo, e evento é uma
 * entrada dentro de um arquivo que já existe. Então toda escrita aqui é
 * ler-alterar-regravar o `content/eventos.json` inteiro — e a leitura vem do
 * GitHub, não do disco. O disco do servidor é o do último deploy: partir dele
 * apagaria, em silêncio, qualquer evento cadastrado depois dele.
 */

export const CAMINHO_DA_AGENDA = "content/eventos.json";

export const STATUS_DO_EVENTO: StatusDoEvento[] = ["confirmado", "a-confirmar"];

export type DadosDoEvento = {
  organizacao: string;
  nome: string;
  data: string;
  hora: string;
  local: string;
  cidade: string;
  status: string;
};

export function validarEvento(dados: DadosDoEvento): string[] {
  const erros: string[] = [];

  if (!dados.organizacao.trim()) erros.push("A organização é obrigatória.");
  if (!dados.nome.trim()) erros.push("O nome do evento é obrigatório.");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.data)) {
    erros.push("A data precisa estar no formato AAAA-MM-DD.");
  }

  if (dados.status && !STATUS_DO_EVENTO.includes(dados.status as StatusDoEvento)) {
    erros.push("Status inválido.");
  }

  return erros;
}

/** A agenda como está no repositório agora. */
export async function lerAgenda(): Promise<Evento[]> {
  const bruto = await lerArquivo(CAMINHO_DA_AGENDA);

  // Arquivo ainda não criado é agenda vazia, não erro.
  if (bruto === undefined) return [];

  const conteudo = JSON.parse(bruto) as unknown;

  if (!Array.isArray(conteudo)) {
    throw new Error(
      `${CAMINHO_DA_AGENDA} não contém uma lista de eventos. Corrija o arquivo antes de usar o painel.`
    );
  }

  return conteudo as Evento[];
}

/**
 * O `id` é o maior já usado mais um, e não o tamanho da lista: excluir um evento
 * do meio faria o tamanho repetir um id que já existiu, e dois eventos com o
 * mesmo id quebrariam a chave de renderização da agenda.
 */
function proximoId(agenda: Evento[]): number {
  return agenda.reduce((maior, evento) => Math.max(maior, evento.id), 0) + 1;
}

function serializar(agenda: Evento[]): ArquivoParaCommit {
  // Ordenada por data e com dois espaços de indentação, como o arquivo mantido à
  // mão — assim o diff do commit mostra só a linha que mudou.
  const ordenada = [...agenda].sort((a, b) => a.data.localeCompare(b.data));

  return {
    caminho: CAMINHO_DA_AGENDA,
    conteudo: Buffer.from(`${JSON.stringify(ordenada, null, 2)}\n`, "utf8"),
  };
}

export function montarInclusao(
  agenda: Evento[],
  dados: DadosDoEvento
): { arquivo: ArquivoParaCommit; evento: Evento } {
  const evento: Evento = {
    id: proximoId(agenda),
    organizacao: dados.organizacao.trim(),
    nome: dados.nome.trim(),
    data: dados.data,
    // Campo vazio fica fora do JSON: `lib/eventos.ts` trata ausente como "não
    // divulgado", e uma string vazia viraria uma linha em branco no card.
    ...(dados.hora.trim() ? { hora: dados.hora.trim() } : {}),
    ...(dados.local.trim() ? { local: dados.local.trim() } : {}),
    ...(dados.cidade.trim() ? { cidade: dados.cidade.trim() } : {}),
    // "confirmado" é o padrão que a leitura assume, então não precisa ir escrito.
    ...(dados.status === "a-confirmar"
      ? { status: "a-confirmar" as StatusDoEvento }
      : {}),
  };

  return { arquivo: serializar([...agenda, evento]), evento };
}

export function montarExclusao(
  agenda: Evento[],
  id: number
): ArquivoParaCommit | undefined {
  const sobrando = agenda.filter((evento) => evento.id !== id);
  return sobrando.length === agenda.length ? undefined : serializar(sobrando);
}
