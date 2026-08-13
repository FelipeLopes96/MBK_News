import FormularioBeehiiv from "@/app/components/FormularioBeehiiv";

/**
 * Card de assinatura da newsletter. A chamada é nossa; a inscrição em si fica
 * com o Beehiiv, que recebe os e-mails e dispara as edições.
 */
export default function NewsletterForm() {
  return (
    // @container: o layout reage à largura do card, não à da janela — na
    // sidebar ele fica estreito; no artigo, onde há espaço, se abre.
    <section className="@container rounded-lg border border-zinc-800 bg-[#242424] p-6 @sm:p-8">
      <h2 className="text-xl font-bold tracking-tight text-white">
        Assine O Corner
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Receba os resumos do final de semana direto no seu e-mail. Todos os
        resultados, análises e bastidores em uma única newsletter.
      </p>

      <FormularioBeehiiv />
    </section>
  );
}
