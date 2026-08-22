"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CampoDeBusca from "@/app/components/CampoDeBusca";
import type { ItemDeNavegacao } from "@/lib/navegacao";

/** Slug utilizável como id de elemento, para ligar o botão à lista que ele abre. */
function idDoGrupo(href: string): string {
  return `submenu-${href.replace(/\W+/g, "-").replace(/^-|-$/g, "")}`;
}

/**
 * Botão de hambúrguer + menu de tela cheia para telas abaixo de lg.
 *
 * Fica isolado do Header para que só ele entre no bundle do cliente — o resto
 * do cabeçalho continua sendo Server Component. É também onde mora a busca no
 * mobile, já que na barra estreita não há largura para o campo.
 */
export default function MenuMobile({ secoes }: { secoes: ItemDeNavegacao[] }) {
  const [aberto, setAberto] = useState(false);
  const [expandidos, setExpandidos] = useState<string[]>([]);
  const caminho = usePathname();

  const ativa = (href: string) =>
    caminho === href || caminho.startsWith(`${href}/`);

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
        className="-mr-2 shrink-0 p-2 text-texto-suave transition-colors hover:text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca lg:hidden"
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

      {/*
        O menu é levado para o `body` por portal, e não renderizado aqui dentro.
        O cabeçalho tem `backdrop-blur`, e `backdrop-filter` cria bloco de
        contenção para descendentes `fixed`: dentro dele, o `inset-0` deixa de
        valer para a viewport e passa a valer para a barra de ~56px. O menu
        abria confinado a uma tira, o que na tela é indistinguível de não abrir.
      */}
      {aberto &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-fundo lg:hidden"
        >
          {/* Mesma altura da barra do cabeçalho, para o menu abrir "no lugar". */}
          <div className="flex shrink-0 items-center justify-between gap-6 px-6 py-3">
            <Image
              src="/marca/mbk-news.png"
              alt="MBK News"
              width={620}
              height={218}
              className="h-8 w-auto sm:h-9"
            />

            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar menu"
              className="-mr-2 p-2 text-texto-suave transition-colors hover:text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
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

          <div className="px-6 pb-2 pt-2">
            <CampoDeBusca variante="cheia" aoEnviar={() => setAberto(false)} />
          </div>

          <nav className="flex flex-col px-6 pb-10">
            {secoes.map((secao) => {
              const expandido = expandidos.includes(secao.href);
              const id = idDoGrupo(secao.href);

              return (
                <div key={secao.href} className="border-b border-linha">
                  {/* O rótulo continua sendo link para a própria seção; quem
                      expande é o botão ao lado. Um elemento só, fazendo as duas
                      coisas, deixaria de ser navegável por teclado e leitor. */}
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={secao.href}
                      onClick={() => setAberto(false)}
                      aria-current={ativa(secao.href) ? "page" : undefined}
                      className={`flex flex-1 items-center gap-3 py-4 text-xl font-semibold transition-colors ${
                        ativa(secao.href)
                          ? "text-marca-clara"
                          : "text-texto hover:text-marca-clara"
                      }`}
                    >
                      {/* Filete na seção atual: no mobile não há barra de
                          seções para carregar essa marcação. */}
                      <span
                        aria-hidden="true"
                        className={`h-5 w-0.5 rounded-full ${
                          ativa(secao.href) ? "bg-marca" : "bg-transparent"
                        }`}
                      />
                      {secao.rotulo}
                    </Link>

                    {secao.subitens?.length ? (
                      <button
                        type="button"
                        onClick={() => alternarGrupo(secao.href)}
                        aria-expanded={expandido}
                        aria-controls={id}
                        aria-label={`${expandido ? "Recolher" : "Expandir"} ${secao.rotulo}`}
                        className="shrink-0 p-3 text-texto-suave transition-colors hover:text-texto focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
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

                  {secao.subitens?.length && expandido ? (
                    <ul
                      id={id}
                      className="mb-4 ml-1 flex flex-col border-l border-linha pl-5"
                    >
                      {secao.subitens.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            onClick={() => setAberto(false)}
                            aria-current={ativa(subitem.href) ? "page" : undefined}
                            className={`block py-3 text-lg transition-colors ${
                              ativa(subitem.href)
                                ? "text-marca-clara"
                                : "text-texto-corpo hover:text-marca-clara"
                            }`}
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
        </div>,
          document.body
        )}
    </>
  );
}
