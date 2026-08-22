import type { Metadata } from "next";
import Container from "@/app/components/Container";
import EventCard from "@/app/components/EventCard";
import TituloDaPagina from "@/app/components/TituloDaPagina";
import { diaDaSemana, ehHoje, getAgendaPorDia } from "@/lib/eventos";
import { formatarData } from "@/lib/datas";
import { metadataDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadataDaPagina({
  titulo: "Agenda de eventos",
  descricao:
    "Os próximos eventos de MMA, boxe, muay thai, kickboxing e jiu-jitsu: data, organização, card e local.",
  caminho: "/eventos",
});

/**
 * A agenda depende de que dia é hoje, e o site é estático: sem isso, o que
 * ficaria no ar é a agenda do último deploy, e um evento passado continuaria
 * listado como próximo até alguém publicar outra matéria. Uma hora é folga de
 * sobra para uma lista que muda algumas vezes por semana.
 */
export const revalidate = 3600;

export default function EventosPage() {
  const agenda = getAgendaPorDia();

  return (
    <Container>
      <TituloDaPagina
        titulo="Agenda"
        descricao="Os próximos eventos dos esportes de combate, do mais próximo ao mais distante."
      />

      {agenda.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-linha px-6 py-20 text-center">
          <p className="font-manchete text-2xl font-bold uppercase tracking-wide text-texto">
            Sem eventos na agenda
          </p>
          <p className="mt-3 max-w-md text-texto-suave">
            Não há eventos confirmados no momento. Assim que houver, eles
            aparecem aqui.
          </p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {agenda.map(({ data, eventos }) => (
            <section key={data}>
              {/* O cabeçalho do dia é o que transforma a lista em agenda: o
                  leitor procura o sábado, não a enésima linha. */}
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linha pb-3">
                <h2 className="font-manchete text-xl font-bold uppercase tracking-wide text-texto">
                  {formatarData(data)}
                </h2>
                <span className="text-sm capitalize text-texto-fraco">
                  {diaDaSemana(data)}
                </span>
                {ehHoje(data) ? (
                  <span className="rounded bg-urgente px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fundo">
                    Hoje
                  </span>
                ) : null}
              </div>

              <ul className="divide-y divide-linha">
                {eventos.map((evento) => (
                  <EventCard
                    key={evento.id}
                    evento={evento}
                    variante="agenda"
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Container>
  );
}
