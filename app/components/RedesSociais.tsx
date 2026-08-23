import { REDES_SOCIAIS } from "@/lib/seo";

/**
 * Links para os perfis oficiais do MBK News.
 *
 * Ícone desenhado em SVG inline, sem script nem badge oficial de rede social:
 * um widget do Instagram traria JavaScript de terceiro e rastreamento para todo
 * leitor que abre a página, inclusive quem nunca vai clicar. Aqui é só um link.
 *
 * A lista vem de `lib/seo.ts`; acrescentar YouTube, TikTok ou X é adicionar uma
 * entrada lá e o desenho correspondente aqui.
 */

type Rede = (typeof REDES_SOCIAIS)[number]["rede"];

const desenhos: Record<Rede, { nome: string; svg: React.ReactNode }> = {
  instagram: {
    nome: "Instagram",
    svg: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="1.15" fill="currentColor" stroke="none" />
      </>
    ),
  },
};

export default function RedesSociais({
  className = "",
}: {
  className?: string;
}) {
  if (REDES_SOCIAIS.length === 0) {
    return null;
  }

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {REDES_SOCIAIS.map(({ rede, url }) => {
        const desenho = desenhos[rede];

        return (
          <li key={rede}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              // O nome da rede fica no rótulo acessível, não ao lado do ícone:
              // o desenho já diz de qual rede se trata a quem vê.
              aria-label={`${desenho.nome} do MBK News`}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-linha bg-superficie text-texto-suave transition-colors hover:border-marca hover:text-marca-clara focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="h-5 w-5"
              >
                {desenho.svg}
              </svg>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
