"use client";

import { useActionState } from "react";
import { entrar, type EstadoDoLogin } from "@/app/admin/acoes";

const estadoInicial: EstadoDoLogin = {};

export default function FormularioDeLogin() {
  const [estado, acao, enviando] = useActionState(entrar, estadoInicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-zinc-300">Senha</span>
        <input
          type="password"
          name="senha"
          autoFocus
          autoComplete="current-password"
          className="rounded-md border border-zinc-700 bg-[#1A1A1A] px-3 py-2 text-white outline-none focus:border-[#F97316]"
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
        className="rounded-md bg-[#F97316] px-4 py-2 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
