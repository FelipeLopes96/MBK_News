"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [inscrito, setInscrito] = useState(false);

  return (
    // @container: o layout do formulário reage à largura do card, não à da janela.
    // Na sidebar ele fica empilhado; no artigo, onde há espaço, vira linha.
    <section className="@container rounded-lg border border-zinc-800 bg-[#242424] p-6 @sm:p-8">
      <h2 className="text-xl font-bold tracking-tight text-white">
        Assine O Corner
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Receba os resumos do final de semana direto no seu e-mail. Todos os
        resultados, análises e bastidores em uma única newsletter.
      </p>

      {inscrito ? (
        <p
          role="status"
          className="mt-6 text-sm font-medium text-[#F97316]"
        >
          Inscrição confirmada! Em breve você recebe o primeiro resumo.
        </p>
      ) : (
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            setInscrito(true);
          }}
          className="mt-6 flex flex-col gap-3 @sm:flex-row"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Seu e-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            placeholder="seu@email.com"
            className="w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#F97316] focus:outline-none @sm:flex-1"
          />
          <button
            type="submit"
            className="w-full shrink-0 rounded-md bg-[#F97316] px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] @sm:w-auto"
          >
            Inscrever
          </button>
        </form>
      )}
    </section>
  );
}
