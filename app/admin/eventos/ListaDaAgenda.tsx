"use client";

import { useActionState, useState } from "react";
import {
  excluirEvento,
  type EstadoDaExclusaoDeEvento,
} from "@/app/admin/acoesDeEvento";

/**
 * A agenda cadastrada, com exclusão.
 *
 * Mostra também o que já passou, ao contrário do site: a página pública esconde
 * evento vencido sozinha, mas o painel é onde se limpa o arquivo — e o que não
 * aparece não se apaga.
 */

type EventoNaLista = {
  id: number;
  organizacao: string;
  nome: string;
  data: string;
  hora?: string;
  local?: string;
  cidade?: string;
  status?: string;
  jaPassou: boolean;
};

const estadoInicial: EstadoDaExclusaoDeEvento = {};

const formatador = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatar(data: string): string {
  const quando = new Date(data);
  return Number.isNaN(quando.getTime()) ? data : formatador.format(quando);
}

export default function ListaDaAgenda({
  eventos,
}: {
  eventos: EventoNaLista[];
}) {
  const [estado, acao, excluindo] = useActionState(
    excluirEvento,
    estadoInicial
  );
  const [confirmando, setConfirmando] = useState<number | null>(null);

  const excluidos = new Set(estado.sucesso ? [estado.sucesso.id] : []);
  const restantes = eventos.filter((evento) => !excluidos.has(evento.id));

  return (
    <div className="flex flex-col gap-4">
      {estado.erro && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200"
        >
          {estado.erro}
        </div>
      )}

      {estado.sucesso && (
        <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-4">
          <p className="text-sm font-semibold text-emerald-300">
            Evento removido da agenda
          </p>
          <a
            href={estado.sucesso.urlDoCommit}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca"
          >
            Ver o commit
          </a>
        </div>
      )}

      {restantes.length === 0 ? (
        <p className="rounded-lg border border-linha bg-superficie p-6 text-sm text-texto-suave">
          Nenhum evento na agenda.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {restantes.map((evento) => {
            const confirmandoEste = confirmando === evento.id;

            return (
              <li
                key={evento.id}
                className={`rounded-lg border p-4 transition-colors ${
                  confirmandoEste
                    ? "border-red-900 bg-red-950/30"
                    : "border-linha bg-superficie"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-texto">
                      <span className="mr-2 rounded bg-superficie-alta px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide text-texto-corpo">
                        {evento.organizacao}
                      </span>
                      {evento.nome}
                    </p>

                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-texto-fraco">
                      <span>{formatar(evento.data)}</span>
                      {evento.hora && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{evento.hora}</span>
                        </>
                      )}
                      {(evento.local || evento.cidade) && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>
                            {[evento.local, evento.cidade]
                              .filter(Boolean)
                              .join(" — ")}
                          </span>
                        </>
                      )}
                      {evento.status === "a-confirmar" && (
                        <span className="font-semibold text-amber-400">
                          a confirmar
                        </span>
                      )}
                      {evento.jaPassou && (
                        <span className="rounded bg-superficie-alta px-1.5 py-0.5 font-semibold text-texto-fraco">
                          já passou
                        </span>
                      )}
                    </p>
                  </div>

                  {!confirmandoEste && (
                    <button
                      type="button"
                      onClick={() => setConfirmando(evento.id)}
                      disabled={excluindo}
                      className="shrink-0 rounded-md border border-linha-forte px-3 py-1.5 text-sm text-texto-suave hover:border-red-800 hover:text-red-300 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                </div>

                {confirmandoEste && (
                  <form action={acao} className="mt-4 border-t border-red-900 pt-4">
                    <input type="hidden" name="id" value={evento.id} />

                    <p className="text-sm text-texto-corpo">
                      Sai da agenda no próximo deploy. Evento que já passou não
                      aparece no site de todo jeito — apagar aqui é só limpeza do
                      arquivo.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        disabled={excluindo}
                        className="rounded-md bg-red-800 px-4 py-2 text-sm font-semibold text-texto hover:opacity-90 disabled:opacity-50"
                      >
                        {excluindo ? "Excluindo..." : "Confirmar exclusão"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmando(null)}
                        disabled={excluindo}
                        className="text-sm text-texto-fraco hover:text-texto-corpo disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
