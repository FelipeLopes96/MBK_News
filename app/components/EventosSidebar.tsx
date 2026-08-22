import EventCard from "@/app/components/EventCard";
import SectionHeader from "@/app/components/SectionHeader";
import { getProximosEventos } from "@/lib/eventos";

/** Teto da lateral: o que passa daqui vive em /eventos. */
const NA_LATERAL = 5;

export default function EventosSidebar() {
  const eventos = getProximosEventos().slice(0, NA_LATERAL);

  // Fora de temporada, ou com a agenda desatualizada, o módulo não aparece —
  // um card "Próximos Eventos" vazio é pior que card nenhum.
  if (eventos.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-linha bg-superficie p-6">
      <SectionHeader
        titulo="Próximos Eventos"
        variante="modulo"
        acao={{ rotulo: "Ver agenda", href: "/eventos" }}
      />

      <ul className="mt-4 divide-y divide-linha">
        {eventos.map((evento) => (
          <EventCard key={evento.id} evento={evento} />
        ))}
      </ul>
    </section>
  );
}
