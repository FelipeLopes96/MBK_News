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
 * Linha de atribuição da imagem de capa: "Foto: crédito / fonte (licença)".
 * Cada parte é opcional — sem nenhuma delas, o componente não renderiza nada.
 * Quando a fonte é uma URL, vira link para a página de origem da imagem.
 *
 * Imagem criada com IA troca o prefixo: em vez de "Foto", sai "Imagem gerada
 * por IA". E nesse caso a linha aparece mesmo sem crédito nenhum — o aviso vale
 * por si, porque o que ele diz ao leitor é que aquilo não é registro do que
 * aconteceu.
 */
export default function CreditoDeImagem({
  imagem,
}: {
  imagem?: ImagemDeNoticia;
}) {
  if (!imagem) {
    return null;
  }

  const { credito, fonte, licenca, geradaPorIA } = imagem;
  if (!credito && !fonte && !licenca && !geradaPorIA) {
    return null;
  }

  const prefixo = geradaPorIA ? "Imagem gerada por IA" : "Foto";
  const temAtribuicao = Boolean(credito || fonte);

  return (
    <p className="mt-2 text-xs leading-5 text-texto-fraco">
      {/* Sem nada para atribuir, o prefixo fecha a frase e dispensa os dois
          pontos pendurados no fim da linha. */}
      {temAtribuicao || licenca ? `${prefixo}:` : prefixo}
      {credito ? ` ${credito}` : null}
      {credito && fonte ? " /" : null}
      {fonte ? (
        ehUrl(fonte) ? (
          <>
            {" "}
            <a
              href={fonte}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-linha-forte hover:text-marca-clara"
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
      {licenca ? (temAtribuicao ? ` (${licenca})` : ` ${licenca}`) : null}
    </p>
  );
}
