import dados from "@/content/eventos.json";

export type Evento = {
  id: number;
  organizacao: string;
  nome: string;
  /** Data em formato ISO (AAAA-MM-DD). */
  data: string;
  local: string;
};

export function getProximosEventos(): Evento[] {
  return [...(dados as Evento[])].sort((a, b) => a.data.localeCompare(b.data));
}

const formatadorDeDia = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  timeZone: "UTC",
});

const formatadorDeMes = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  timeZone: "UTC",
});

export function diaDoEvento(data: string): string {
  return formatadorDeDia.format(new Date(data));
}

export function mesDoEvento(data: string): string {
  return formatadorDeMes.format(new Date(data)).replace(".", "").toUpperCase();
}
