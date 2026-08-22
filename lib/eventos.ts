import dados from "@/content/eventos.json";
import { dataDeHoje } from "@/lib/datas";

/**
 * Agenda de eventos, mantida à mão em `content/eventos.json`.
 *
 * O que a lista publica é o que ainda vai acontecer: evento cuja data já passou
 * sai da agenda sozinho, sem ninguém precisar limpar o arquivo. Antes a função
 * devolvia tudo, e a home mostrava como "próximo" um card do fim de semana
 * anterior.
 */

export type StatusDoEvento = "confirmado" | "a-confirmar";

export type Evento = {
  id: number;
  /** Sigla da organização — ex.: "UFC", "ONE", "PFL". */
  organizacao: string;
  nome: string;
  /** Data em formato ISO (AAAA-MM-DD). */
  data: string;
  /** Horário de início, quando divulgado — ex.: "18h". */
  hora?: string;
  /** Ginásio, arena ou casa de espetáculo. */
  local?: string;
  /** Cidade e país. */
  cidade?: string;
  /** Ausente, o evento é tratado como confirmado. */
  status?: StatusDoEvento;
};

function todos(): Evento[] {
  return [...(dados as Evento[])].sort((a, b) => a.data.localeCompare(b.data));
}

/** Do próximo ao mais distante. Evento de hoje ainda conta como próximo. */
export function getProximosEventos(): Evento[] {
  const hoje = dataDeHoje();
  return todos().filter((evento) => evento.data >= hoje);
}

/** `true` quando o evento é hoje — a agenda destaca esse caso. */
export function ehHoje(data: string): boolean {
  return data === dataDeHoje();
}

/**
 * Agenda agrupada por dia, na ordem. É a forma que uma agenda esportiva pede:
 * o leitor procura "o que tem no sábado", não a enésima linha de uma lista.
 */
export function getAgendaPorDia(): { data: string; eventos: Evento[] }[] {
  const porDia = new Map<string, Evento[]>();

  for (const evento of getProximosEventos()) {
    const doDia = porDia.get(evento.data) ?? [];
    doDia.push(evento);
    porDia.set(evento.data, doDia);
  }

  return [...porDia.entries()].map(([data, eventos]) => ({ data, eventos }));
}

const formatadorDeDia = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  timeZone: "UTC",
});

const formatadorDeMes = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: "UTC",
});

const formatadorDeSemana = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  timeZone: "UTC",
});

export function diaDoEvento(data: string): string {
  return formatadorDeDia.format(new Date(data));
}

export function mesDoEvento(data: string): string {
  return formatadorDeMes.format(new Date(data)).replace(".", "").toUpperCase();
}

/** "sábado" — usado no cabeçalho de cada dia da agenda. */
export function diaDaSemana(data: string): string {
  return formatadorDeSemana.format(new Date(data));
}
