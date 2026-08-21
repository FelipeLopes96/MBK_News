"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Etiqueta from "@/app/components/Etiqueta";
import { filtrar, type ItemDoIndice } from "@/lib/busca";
// De `@/lib/datas`, e não de `@/lib/conteudo`: aquele lê disco e não pode
// atravessar a fronteira para o navegador.
import { formatarData } from "@/lib/datas";

/**
 * Campo de busca e resultados.
 *
 * O índice chega pronto do servidor e a filtragem acontece aqui, a cada tecla:
 * a página segue estática e o resultado aparece sem ida ao servidor.
 */
export default function ResultadosDaBusca({
  indice,
}: {
  indice: ItemDoIndice[];
}) {
  const consulta = useSearchParams().get("q") ?? "";
  const [termo, setTermo] = useState(consulta);

  // O campo é editável, então tem estado próprio — mas a busca do cabeçalho
  // navega para /busca?q=… com a página já montada, e aí o `?q=` manda. O
  // ajuste é feito durante a renderização, e não num efeito: assim o React
  // reinicia este render em vez de pintar a tela com o termo velho e corrigir
  // logo depois.
  const [consultaAnterior, setConsultaAnterior] = useState(consulta);
  if (consulta !== consultaAnterior) {
    setConsultaAnterior(consulta);
    setTermo(consulta);
  }

  const resultados = useMemo(() => filtrar(indice, termo), [indice, termo]);
  const buscou = termo.trim().length > 0;

  return (
    <>
      <label htmlFor="busca" className="sr-only">
        Buscar no MBK News
      </label>
      <input
        id="busca"
        type="search"
        value={termo}
        onChange={(evento) => setTermo(evento.target.value)}
        placeholder="Atleta, evento, organização…"
        // Quem chega pela busca do cabeçalho já digitou; quem abre /busca
        // direto encontra o cursor no lugar.
        autoFocus
        className="mt-6 w-full rounded-lg border border-linha bg-superficie px-4 py-3 text-lg text-texto placeholder:text-texto-fraco focus:border-marca focus:outline-none"
      />

      {buscou ? (
        <p className="mt-4 text-sm text-texto-fraco">
          {resultados.length === 0
            ? "Nenhum resultado."
            : `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"} para “${termo.trim()}”.`}
        </p>
      ) : (
        <p className="mt-4 text-sm text-texto-fraco">
          Busque por matérias, atletas, organizações e conteúdo do Arquivo.
        </p>
      )}

      <ul className="mt-6 divide-y divide-linha border-t border-linha">
        {resultados.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col gap-1.5 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              <div className="flex items-center gap-3">
                <Etiqueta variante="texto">{item.rotulo}</Etiqueta>
                {item.data ? (
                  <time
                    dateTime={item.data}
                    className="text-[10px] font-semibold uppercase tracking-wide text-texto-fraco sm:text-xs"
                  >
                    {formatarData(item.data)}
                  </time>
                ) : null}
              </div>

              <h2 className="text-lg font-semibold leading-snug text-texto transition-colors group-hover:text-marca-clara">
                {item.titulo}
              </h2>

              {item.resumo ? (
                <p className="line-clamp-2 text-sm leading-6 text-texto-suave">
                  {item.resumo}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
