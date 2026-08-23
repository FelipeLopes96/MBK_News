"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { excluirNoticia, type EstadoDaExclusao } from "@/app/admin/acoes";

/**
 * A lista de matérias com os botões de corrigir e excluir.
 *
 * A exclusão pede confirmação na própria linha, e não num `confirm()` do
 * navegador: o diálogo nativo trava a página inteira e, pior, não tem onde
 * mostrar quais arquivos vão sair do repositório — que é justamente o que o
 * editor precisa ler antes de decidir.
 */

type Materia = {
  slug: string;
  date: string;
  title: string;
  rotuloDaCategoria: string;
  destaque: boolean;
  aguardandoDeploy: boolean;
};

const estadoInicial: EstadoDaExclusao = {};

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

export default function ListaDeMaterias({ materias }: { materias: Materia[] }) {
  const [estado, acao, excluindo] = useActionState(
    excluirNoticia,
    estadoInicial
  );
  /** Qual linha está com a confirmação aberta. Uma de cada vez. */
  const [confirmando, setConfirmando] = useState("");

  const excluidos = new Set(estado.sucesso ? [estado.sucesso.slug] : []);

  if (materias.length === 0) {
    return (
      <p className="rounded-lg border border-linha bg-superficie p-6 text-sm text-texto-suave">
        Nenhuma matéria no repositório ainda.
      </p>
    );
  }

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
            Matéria excluída
          </p>
          <p className="mt-1 text-sm text-texto-corpo">
            Saíram do repositório:{" "}
            {estado.sucesso.caminhos.map((caminho, indice) => (
              <span key={caminho}>
                {indice > 0 && ", "}
                <code className="text-texto-suave">{caminho}</code>
              </span>
            ))}
            . O commit fica no histórico — revertê-lo traz a matéria de volta.
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

      <ul className="flex flex-col gap-3">
        {materias.map((materia) => {
          // A lista vem do servidor e não muda sozinha depois da exclusão; a
          // linha some aqui para o editor não tentar excluir duas vezes.
          if (excluidos.has(materia.slug)) return null;

          const confirmandoEsta = confirmando === materia.slug;

          return (
            <li
              key={materia.slug}
              className={`rounded-lg border p-4 transition-colors ${
                confirmandoEsta
                  ? "border-red-900 bg-red-950/30"
                  : "border-linha bg-superficie"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                <div className="min-w-0">
                  <p className="font-semibold text-texto">{materia.title}</p>

                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-texto-fraco">
                    <span>{formatar(materia.date)}</span>
                    {materia.rotuloDaCategoria && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{materia.rotuloDaCategoria}</span>
                      </>
                    )}
                    <span aria-hidden="true">•</span>
                    <code>/noticia/{materia.slug}</code>
                    {materia.destaque && (
                      <span className="rounded bg-marca px-1.5 py-0.5 font-semibold text-texto">
                        Manchete
                      </span>
                    )}
                    {materia.aguardandoDeploy && (
                      <span className="font-semibold text-amber-400">
                        aguardando o deploy
                      </span>
                    )}
                  </p>
                </div>

                {!confirmandoEsta && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/materias/${materia.slug}`}
                      className="rounded-md border border-linha-forte px-3 py-1.5 text-sm text-texto-corpo hover:border-marca"
                    >
                      Corrigir
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmando(materia.slug)}
                      disabled={excluindo}
                      className="rounded-md border border-linha-forte px-3 py-1.5 text-sm text-texto-suave hover:border-red-800 hover:text-red-300 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>

              {confirmandoEsta && (
                <form action={acao} className="mt-4 border-t border-red-900 pt-4">
                  <input type="hidden" name="slug" value={materia.slug} />

                  <p className="text-sm text-texto-corpo">
                    Excluir apaga o arquivo da matéria e as imagens que são dela.
                    O endereço <code>/noticia/{materia.slug}</code> passa a
                    responder 404 para quem tem o link e para o Google — se o
                    problema for um erro no texto, corrigir preserva o endereço.
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
    </div>
  );
}
