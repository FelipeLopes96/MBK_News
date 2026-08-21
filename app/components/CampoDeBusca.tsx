import Form from "next/form";

/**
 * Campo de busca do cabeçalho e do menu mobile.
 *
 * Usa o `Form` do Next em vez de um formulário comum: a submissão vira
 * navegação do cliente para /busca?q=…, e continua funcionando sem JavaScript,
 * porque no fim é um form GET de verdade.
 */
export default function CampoDeBusca({
  variante = "compacta",
  aoEnviar,
}: {
  /** `compacta` cabe na barra; `cheia` ocupa a largura do menu mobile. */
  variante?: "compacta" | "cheia";
  /** Chamado no envio — o menu mobile usa para se fechar. */
  aoEnviar?: () => void;
}) {
  const cheia = variante === "cheia";

  return (
    <Form action="/busca" onSubmit={aoEnviar} className="relative">
      <label htmlFor={`busca-${variante}`} className="sr-only">
        Buscar no MBK News
      </label>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-texto-fraco ${
          cheia ? "left-3.5 h-5 w-5" : "left-2.5 h-4 w-4"
        }`}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.5-4.5" />
      </svg>

      <input
        id={`busca-${variante}`}
        name="q"
        type="search"
        placeholder="Buscar"
        className={`w-full rounded-md border border-linha bg-superficie text-texto placeholder:text-texto-fraco transition-colors focus:border-marca focus:outline-none ${
          cheia
            ? "py-3 pl-11 pr-4 text-base"
            : "py-1.5 pl-9 pr-3 text-sm lg:w-44 xl:w-56"
        }`}
      />
    </Form>
  );
}
