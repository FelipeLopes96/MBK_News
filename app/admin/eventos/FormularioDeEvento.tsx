"use client";

import { useActionState, useState } from "react";
import {
  adicionarEvento,
  type EstadoDoEvento,
} from "@/app/admin/acoesDeEvento";

/**
 * Cadastro de um evento na agenda.
 *
 * Campos controlados, como nos outros formulários do painel: envio recusado não
 * pode apagar o que o editor digitou.
 */

const estadoInicial: EstadoDoEvento = { erros: [] };

const campo =
  "w-full rounded-md border border-linha-forte bg-fundo px-3 py-2 text-texto outline-none focus:border-marca";
const rotulo = "text-sm font-semibold text-texto-corpo";
const dica = "text-xs text-texto-fraco";

const formatador = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default function FormularioDeEvento({
  hoje,
  organizacoesUsadas,
}: {
  hoje: string;
  /** Siglas já usadas na agenda, para o editor não inventar uma variação nova. */
  organizacoesUsadas: string[];
}) {
  const [estado, acao, enviando] = useActionState(
    adicionarEvento,
    estadoInicial
  );

  const [organizacao, setOrganizacao] = useState("");
  const [nome, setNome] = useState("");
  const [data, setData] = useState(hoje);
  const [hora, setHora] = useState("");
  const [local, setLocal] = useState("");
  const [cidade, setCidade] = useState("");
  const [status, setStatus] = useState("confirmado");
  /**
   * `useActionState` não tem reset. Sem isto, "Adicionar outro" não teria como
   * voltar ao formulário: navegar para a própria rota é navegação suave, o
   * componente não remonta e o aviso de sucesso continuaria na tela.
   */
  const [sucessoDispensado, setSucessoDispensado] = useState(false);

  function limpar() {
    setOrganizacao("");
    setNome("");
    setData(hoje);
    setHora("");
    setLocal("");
    setCidade("");
    setStatus("confirmado");
  }

  if (estado.sucesso && !sucessoDispensado) {
    const quando = new Date(estado.sucesso.data);
    const dataLegivel = Number.isNaN(quando.getTime())
      ? estado.sucesso.data
      : formatador.format(quando);

    return (
      <div className="rounded-lg border border-emerald-800 bg-emerald-950/40 p-6">
        <h2 className="text-lg font-bold text-emerald-300">
          Evento na agenda
        </h2>
        <p className="mt-2 text-sm text-texto-corpo">
          <strong className="text-texto">{estado.sucesso.nome}</strong> entrou na
          agenda em {dataLegivel}. A Vercel republica o site sozinha — em cerca
          de um minuto ele aparece em <code className="text-texto-suave">/eventos</code>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={estado.sucesso.urlDoCommit}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-linha-forte px-4 py-2 text-sm text-texto-corpo hover:border-marca"
          >
            Ver o commit
          </a>
          <button
            type="button"
            onClick={() => {
              limpar();
              setSucessoDispensado(true);
            }}
            className="rounded-md bg-marca px-4 py-2 text-sm font-semibold text-texto hover:opacity-90"
          >
            Adicionar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-6">
      {estado.erros.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/40 p-4"
        >
          <p className="font-semibold text-red-300">
            O evento não foi adicionado:
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-red-200">
            {estado.erros.map((erro) => (
              <li key={erro}>{erro}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <label className="flex flex-col gap-2">
          <span className={rotulo}>Organização</span>
          <input
            name="organizacao"
            value={organizacao}
            onChange={(evento) => setOrganizacao(evento.target.value)}
            placeholder="UFC"
            list="organizacoes-da-agenda"
            className={campo}
          />
          {/* Sugere o que a agenda já usa: sem isso, "ONE" e "ONE Championship"
              acabam convivendo como se fossem duas organizações. */}
          <datalist id="organizacoes-da-agenda">
            {organizacoesUsadas.map((sigla) => (
              <option key={sigla} value={sigla} />
            ))}
          </datalist>
          <span className={dica}>A sigla, como aparece no card.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Nome do evento</span>
          <input
            name="nome"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="UFC 330: Makhachev x Garry"
            className={campo}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className={rotulo}>Data</span>
          <input
            type="date"
            name="data"
            value={data}
            onChange={(evento) => setData(evento.target.value)}
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Horário</span>
          <input
            name="hora"
            value={hora}
            onChange={(evento) => setHora(evento.target.value)}
            placeholder="18h"
            className={campo}
          />
          <span className={dica}>Opcional, quando divulgado.</span>
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Status</span>
          <select
            name="status"
            value={status}
            onChange={(evento) => setStatus(evento.target.value)}
            className={campo}
          >
            <option value="confirmado">Confirmado</option>
            <option value="a-confirmar">A confirmar</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={rotulo}>Local</span>
          <input
            name="local"
            value={local}
            onChange={(evento) => setLocal(evento.target.value)}
            placeholder="Golden 1 Center"
            className={campo}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={rotulo}>Cidade</span>
          <input
            name="cidade"
            value={cidade}
            onChange={(evento) => setCidade(evento.target.value)}
            placeholder="Sacramento, Estados Unidos"
            className={campo}
          />
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-linha pt-4">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-marca px-6 py-2.5 font-semibold text-texto transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {enviando ? "Adicionando..." : "Adicionar à agenda"}
        </button>
        <button
          type="button"
          onClick={limpar}
          disabled={enviando}
          className="text-sm text-texto-fraco hover:text-texto-corpo disabled:opacity-50"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
