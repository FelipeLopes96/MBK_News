"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type LinkDoMenu = { href: string; rotulo: string };

/**
 * Botão de hambúrguer + menu fullscreen para telas abaixo de lg.
 * Fica isolado do Header para que só ele entre no bundle do cliente —
 * o resto do cabeçalho continua sendo Server Component.
 */
export default function MenuMobile({ links }: { links: LinkDoMenu[] }) {
  const [aberto, setAberto] = useState(false);

  // Enquanto o menu cobre a tela, o body não deve rolar por trás dele.
  // O Esc fecha, como em qualquer diálogo.
  useEffect(() => {
    if (!aberto) return;

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAberto(false);
    };
    document.addEventListener("keydown", aoTeclar);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir menu"
        aria-expanded={aberto}
        className="-mr-2 shrink-0 p-2 text-zinc-300 transition-colors hover:text-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] lg:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#1A1A1A] lg:hidden"
        >
          {/* Mesma altura da barra do cabeçalho, para o menu abrir "no lugar". */}
          <div className="flex shrink-0 items-center justify-between gap-6 px-6 py-4">
            <span className="text-2xl font-extrabold tracking-tight text-[#F97316]">
              O Corner
            </span>

            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar menu"
              className="-mr-2 p-2 text-zinc-300 transition-colors hover:text-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col px-6 pb-10">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setAberto(false)}
                className="border-b border-zinc-800 py-5 text-xl font-semibold text-white transition-colors hover:text-[#F97316]"
              >
                {link.rotulo}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
