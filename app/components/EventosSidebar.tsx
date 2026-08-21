import SectionHeader from "@/app/components/SectionHeader";
import {
  diaDoEvento,
  getProximosEventos,
  mesDoEvento,
  type Evento,
} from "@/lib/eventos";

const coresPorOrganizacao: Record<string, string> = {
  UFC: "border-red-500/30 bg-red-500/15 text-red-400",
  ONE: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  PFL: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  "Jungle Fight": "border-lime-500/30 bg-lime-500/15 text-lime-400",
  WGP: "border-amber-500/30 bg-amber-500/15 text-amber-400",
};

function badgeDaOrganizacao(organizacao: string): string {
  return (
    coresPorOrganizacao[organizacao] ??
    "border-linha-forte bg-superficie-alta text-texto-corpo"
  );
}

function ItemDeEvento({ evento }: { evento: Evento }) {
  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-superficie-alta text-center">
        <span className="text-base font-bold leading-none text-texto">
          {diaDoEvento(evento.data)}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-marca-clara">
          {mesDoEvento(evento.data)}
        </span>
      </div>

      <div className="min-w-0">
        <span
          className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeDaOrganizacao(
            evento.organizacao
          )}`}
        >
          {evento.organizacao}
        </span>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-texto">
          {evento.nome}
        </p>
        <p className="mt-0.5 truncate text-xs text-texto-fraco">
          {evento.hora ? `${evento.hora} · ` : null}
          {evento.local}
        </p>
      </div>
    </li>
  );
}

export default function EventosSidebar() {
  const eventos = getProximosEventos();

  return (
    <section className="rounded-lg border border-linha bg-superficie p-6">
      <SectionHeader titulo="Próximos Eventos" variante="modulo" />

      <ul className="mt-4 divide-y divide-linha">
        {eventos.map((evento) => (
          <ItemDeEvento key={evento.id} evento={evento} />
        ))}
      </ul>
    </section>
  );
}
