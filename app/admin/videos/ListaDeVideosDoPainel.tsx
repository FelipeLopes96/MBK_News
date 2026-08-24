"use client";

import { useActionState, useState } from "react";
import {
  excluirVideo,
  type EstadoDaExclusaoDeVideo,
} from "@/app/admin/acoesDeVideo";

/**
 * Vídeos cadastrados, com exclusão.
 *
 * A confirmação fica na própria linha, e não num `confirm()` do navegador: o
 * diálogo nativo trava a página e não tem onde dizer o que vai sair do
 * repositório.
 */

type VideoNaLista = {
  slug: string;
  title: string;
  rotuloDaCategoria: string;
  publicadoEm: string;
  destaque: boolean;
};

const estadoInicial: EstadoDaExclusaoDeVideo = {};

const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatar(data: string): string {
  const quando = new Date(data);
  return Number.isNaN(quando.getTime()) ? data : formatador.format(quando);
}

export default function ListaDeVideosDoPainel({
  videos,
}: {
  videos: VideoNaLista[];
}) {
  const [estado, acao, excluindo] = useActionState(
    excluirVideo,
    estadoInicial
  );
  const [confirmando, setConfirmando] = useState("");

  const excluidos = new Set(estado.sucesso ? [estado.sucesso.slug] : []);
  const restantes = videos.filter((video) => !excluidos.has(video.slug));

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
            Vídeo excluído
          </p>
          <p className="mt-1 text-sm text-texto-corpo">
            Saiu do repositório:{" "}
            <code className="text-texto-suave">{estado.sucesso.caminho}</code>. O
            commit fica no histórico — revertê-lo traz o cadastro de volta.
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
          Nenhum vídeo cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {restantes.map((video) => {
            const confirmandoEste = confirmando === video.slug;

            return (
              <li
                key={video.slug}
                className={`rounded-lg border p-4 transition-colors ${
                  confirmandoEste
                    ? "border-red-900 bg-red-950/30"
                    : "border-linha bg-superficie"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-texto">{video.title}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-texto-fraco">
                      <span>{formatar(video.publicadoEm)}</span>
                      {video.rotuloDaCategoria && (
                        <>
                          <span aria-hidden="true">•</span>
                          <span>{video.rotuloDaCategoria}</span>
                        </>
                      )}
                      <span aria-hidden="true">•</span>
                      <code>/videos/{video.slug}</code>
                      {video.destaque && (
                        <span className="rounded bg-marca px-1.5 py-0.5 font-semibold text-texto">
                          Destaque
                        </span>
                      )}
                    </p>
                  </div>

                  {!confirmandoEste && (
                    <button
                      type="button"
                      onClick={() => setConfirmando(video.slug)}
                      disabled={excluindo}
                      className="shrink-0 rounded-md border border-linha-forte px-3 py-1.5 text-sm text-texto-suave hover:border-red-800 hover:text-red-300 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  )}
                </div>

                {confirmandoEste && (
                  <form action={acao} className="mt-4 border-t border-red-900 pt-4">
                    <input type="hidden" name="slug" value={video.slug} />

                    <p className="text-sm text-texto-corpo">
                      Sai da biblioteca e o endereço{" "}
                      <code>/videos/{video.slug}</code> passa a responder 404. O
                      vídeo em si continua no YouTube — o que se apaga aqui é o
                      cadastro.
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
                        onClick={() => setConfirmando("")}
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
