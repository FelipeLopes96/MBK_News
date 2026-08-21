"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type LinkDoMenu = {
  href: string;
  rotulo: string;
  /** Sub-seções, que o item passa a poder expandir sem sair do menu. */
  subitens?: LinkDoMenu[];
};

/** Slug utilizável como id de elemento, para ligar o botão à lista que ele abre. */
function idDoGrupo(href: string): string {
  return `submenu-${href.replace(/\W+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Botão de hambúrguer + menu fullscreen para telas abaixo de lg.
 * Fica isolado do Header para que só ele entre no bundle do cliente —
 * o resto do cabeçalho continua sendo Server Component.
 */
export default function MenuMobile({ links }: { links: LinkDoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const [expandidos, setExpandidos] = useState<string[]>([]);

  const alternarGrupo = (href: string) =>
    setExpandidos((atuais) =>
      atuais.includes(href)
        ? atuais.filter((item) => item !== href)
        : [...atuais, href]
    );

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
        className="-mr-2 shrink-0 p-2 text-texto-corpo transition-colors hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca lg:hidden"
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
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-fundo lg:hidden"
        >
          {/* Mesma altura da barra do cabeçalho, para o menu abrir "no lugar". */}
          <div className="flex shrink-0 items-center justify-between gap-6 px-6 py-4">
            {/* Mesmo logo da barra, para o menu não parecer outra página. */}
            <Image
              src="/marca/mbk-news.png"
              alt="MBK News"
              width={620}
              height={218}
              className="h-9 w-auto"
            />

            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar menu"
              className="-mr-2 p-2 text-texto-corpo transition-colors hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
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
            {links.map((link) => {
              const expandido = expandidos.includes(link.href);
              const id = idDoGrupo(link.href);

              return (
                <div key={link.href} className="border-b border-linha">
                  {/* O rótulo continua sendo link para a própria seção; quem
                      expande é o botão ao lado. Um elemento só, fazendo as duas
                      coisas, deixaria de ser navegável por teclado e leitor. */}
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={link.href}
                      onClick={() => setAberto(false)}
                      className="flex-1 py-5 text-xl font-semibold text-texto transition-colors hover:text-marca-clara"
                    >
                      {link.rotulo}
                    </Link>

                    {link.subitens?.length ? (
                      <button
                        type="button"
                        onClick={() => alternarGrupo(link.href)}
                        aria-expanded={expandido}
                        aria-controls={id}
                        aria-label={`${expandido ? "Recolher" : "Expandir"} ${link.rotulo}`}
                        className="shrink-0 p-3 text-texto-suave transition-colors hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className={`h-5 w-5 transition-transform ${expandido ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    ) : null}
                  </div>

                  {link.subitens?.length && expandido ? (
                    <ul
                      id={id}
                      className="mb-4 ml-1 flex flex-col border-l border-linha pl-5"
                    >
                      {link.subitens.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            onClick={() => setAberto(false)}
                            className="block py-3 text-lg text-texto-corpo transition-colors hover:text-marca-clara"
                          >
                            {subitem.rotulo}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
