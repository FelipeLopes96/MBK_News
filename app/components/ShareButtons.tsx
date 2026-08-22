"use client";

import { useState } from "react";

/**
 * Compartilhamento da matéria.
 *
 * Sem SDK de rede social nenhum: são links de intenção — o endereço que cada
 * plataforma expõe para receber um compartilhamento — e a API de área de
 * transferência do próprio navegador. Um widget oficial do X ou do Facebook
 * traria script de terceiro e rastreamento para todo leitor que abre a página,
 * inclusive quem não vai compartilhar nada.
 */

type Destino = {
  nome: string;
  /** Monta a URL de compartilhamento a partir do título e do endereço. */
  href: (titulo: string, url: string) => string;
  /** Caminho do ícone, em `viewBox="0 0 24 24"`. */
  icone: string;
};

const destinos: Destino[] = [
  {
    nome: "WhatsApp",
    href: (titulo, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`,
    icone:
      "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.15c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.22-4.92-4.42-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.26-.29.57-.36.77-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.45.29.15.46.12.63-.07.17-.2.73-.85.93-1.14.19-.29.39-.24.66-.15.27.1 1.69.8 1.98.94.29.15.48.22.55.34.07.13.07.75-.17 1.42Z",
  },
  {
    nome: "X",
    href: (titulo, url) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${encodeURIComponent(url)}`,
    icone:
      "M18.9 2H22l-7.1 8.1L22.6 22h-6.3l-4.9-6.4L5.6 22H2.5l7.4-8.5L1.7 2h6.4l4.6 6 5.2-6h1Zm-1.1 18h1.7L7.2 3.7H5.4L17.8 20Z",
  },
  {
    nome: "Facebook",
    href: (_titulo, url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icone:
      "M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z",
  },
];

export default function ShareButtons({
  titulo,
  url,
}: {
  titulo: string;
  /** URL absoluta da matéria — montada no servidor. */
  url: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      // Volta ao rótulo normal sozinho: aviso que fica na tela vira ruído.
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Navegador sem permissão de área de transferência: o leitor ainda tem a
      // URL na barra de endereços, então não há o que avisar.
    }
  };

  const classe =
    "flex h-10 w-10 items-center justify-center rounded-full border border-linha bg-superficie text-texto-suave transition-colors hover:border-marca hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca";

  return (
    <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-linha pt-6">
      <span className="text-xs font-bold uppercase tracking-widest text-texto-fraco">
        Compartilhar
      </span>

      <div className="flex items-center gap-2">
        {destinos.map((destino) => (
          <a
            key={destino.nome}
            href={destino.href(titulo, url)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Compartilhar no ${destino.nome}`}
            className={classe}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d={destino.icone} />
            </svg>
          </a>
        ))}

        <button
          type="button"
          onClick={copiar}
          aria-label="Copiar link da matéria"
          className={classe}
        >
          {copiado ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-4 w-4 text-marca-clara"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
            >
              <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
            </svg>
          )}
        </button>
      </div>

      {/* O aviso é anunciado por leitor de tela, não só mostrado no ícone. */}
      <span aria-live="polite" className="text-xs text-texto-fraco">
        {copiado ? "Link copiado." : ""}
      </span>
    </div>
  );
}
