import {
  diaDoEvento,
  ehHoje,
  mesDoEvento,
  type Evento,
} from "@/lib/eventos";

/**
 * Linha de evento da agenda.
 *
 * O bloco de data à esquerda é o que faz a lista ser lida como agenda e não
 * como notícia: o olho corre pela coluna de datas e para no dia que interessa.
 *
 * A sigla da organização vem em pastilha neutra, igual para todas. A versão
 * anterior dava uma cor por organização — vermelho para o UFC, verde para a
 * PFL, âmbar para o WGP — e o resultado era uma lateral com cinco cores
 * competindo entre si e com a cor da marca.
 */
export default function EventCard({
  evento,
  variante = "compacta",
}: {
  evento: Evento;
  /** `agenda` é a linha da página /eventos, com local e cidade. */
  variante?: "agenda" | "compacta";
}) {
  const agenda = variante === "agenda";
  const hoje = ehHoje(evento.data);

  return (
    <li className={`flex gap-4 ${agenda ? "py-5" : "py-4 first:pt-0 last:pb-0"}`}>
      <div
        className={`flex shrink-0 flex-col items-center justify-center rounded-md text-center ${
          hoje ? "bg-marca" : "bg-superficie-alta"
        } ${agenda ? "h-16 w-16" : "h-12 w-12"}`}
      >
        <span
          className={`font-manchete font-bold leading-none text-texto ${
            agenda ? "text-2xl" : "text-base"
          }`}
        >
          {diaDoEvento(evento.data)}
        </span>
        <span
          className={`mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide ${
            hoje ? "text-texto" : "text-marca-clara"
          }`}
        >
          {mesDoEvento(evento.data)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded border border-linha-forte bg-superficie-alta px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-texto-corpo">
            {evento.organizacao}
          </span>

          {hoje ? (
            <span className="inline-block rounded bg-urgente px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-fundo">
              Hoje
            </span>
          ) : null}

          {evento.status === "a-confirmar" ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-texto-fraco">
              A confirmar
            </span>
          ) : null}
        </div>

        <p
          className={`mt-1.5 font-semibold leading-snug text-texto ${
            agenda ? "text-lg" : "text-sm"
          }`}
        >
          {evento.nome}
        </p>

        {/* Na agenda, local e cidade ficam em linhas separadas; na lateral, o
            espaço só permite uma linha resumida. */}
        {agenda ? (
          <div className="mt-1 text-sm text-texto-suave">
            {evento.local ? <p>{evento.local}</p> : null}
            {evento.cidade ? (
              <p className="text-texto-fraco">{evento.cidade}</p>
            ) : null}
            {!evento.local && !evento.cidade ? (
              <p className="text-texto-fraco">Local a confirmar</p>
            ) : null}
            {evento.hora ? (
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-texto-fraco">
                A partir das {evento.hora}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-0.5 truncate text-xs text-texto-fraco">
            {evento.hora ? `${evento.hora} · ` : null}
            {[evento.local, evento.cidade].filter(Boolean).join(", ") ||
              "Local a confirmar"}
          </p>
        )}
      </div>
    </li>
  );
}
