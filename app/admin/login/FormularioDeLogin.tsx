"use client";

import { useActionState } from "react";
import { entrar, type EstadoDoLogin } from "@/app/admin/acoes";

const estadoInicial: EstadoDoLogin = {};

export default function FormularioDeLogin() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-texto-corpo">Senha</span>
        <input
          type="password"
          name="senha"
          autoFocus
          autoComplete="current-password"
          className="rounded-md border border-linha-forte bg-fundo px-3 py-2 text-texto outline-none focus:border-marca"
        />
      </label>

      {estado.erro && (
        <p role="alert" className="text-sm text-red-400">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-md bg-marca px-4 py-2 font-semibold text-texto transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
