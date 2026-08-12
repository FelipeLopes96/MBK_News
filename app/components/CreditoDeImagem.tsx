import type { ImagemDeNoticia } from "@/lib/noticias";

/** Domínio sem "www." — usado como rótulo quando a fonte é uma URL. */
function rotuloDoLink(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ehUrl(valor: string): boolean {
  return /^https?:\/\//.test(valor);
}

/**
 * Linha de atribuição da foto de capa: "Foto: crédito / fonte (licença)".
 * Cada parte é opcional — sem nenhuma delas, o componente não renderiza nada.
 * Quando a fonte é uma URL, vira link para a página de origem da imagem.
 */
export default function CreditoDeImagem({
  imagem,
}: {
  imagem?: ImagemDeNoticia;
}) {
  if (!imagem) {
    return null;
  }

  const { credito, fonte, licenca } = imagem;
  if (!credito && !fonte && !licenca) {
    return null;
  }

  return (
    <p className="mt-2 text-xs leading-5 text-zinc-500">
      Foto:{credito ? ` ${credito}` : null}
      {credito && fonte ? " /" : null}
      {fonte ? (
        ehUrl(fonte) ? (
          <>
            {" "}
            <a
              href={fonte}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-zinc-700 hover:text-[#F97316]"
            >
              {rotuloDoLink(fonte)}
            </a>
          </>
        ) : (
          ` ${fonte}`
        )
      ) : null}
      {/* Sem crédito nem fonte, a licença assume o lugar deles em vez de
          aparecer sozinha entre parênteses. */}
      {licenca ? (credito || fonte ? ` (${licenca})` : ` ${licenca}`) : null}
    </p>
  );
}
