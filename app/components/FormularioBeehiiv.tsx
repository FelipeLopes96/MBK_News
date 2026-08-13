"use client";

import { useEffect, useRef } from "react";

const LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";
const FORMULARIO = "f20a34d0-75f5-445b-97dd-0361644db625";

/**
 * Formulário de inscrição hospedado no Beehiiv, que é quem recebe e guarda os
 * e-mails — daí o embed em vez de um form nosso.
 *
 * O script é injetado aqui dentro, e não com next/script, porque o loader do
 * Beehiiv monta o formulário ao lado da própria tag <script>: hospedado no
 * <head>, como o next/script faria, o formulário não cairia neste ponto da
 * página.
 */
export default function FormularioBeehiiv() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const alvo = container.current;
    // Em desenvolvimento o efeito roda duas vezes; sem a guarda o loader
    // injetaria dois formulários no mesmo lugar.
    if (!alvo || alvo.querySelector("script")) {
      return;
    }

    const script = document.createElement("script");
    script.src = LOADER;
    script.async = true;
    script.dataset.beehiivForm = FORMULARIO;
    alvo.appendChild(script);
  }, []);

  // O embed vem como iframe: o max-width impede que ele estoure o card nas
  // larguras estreitas (sidebar e celular).
  return <div ref={container} className="mt-6 [&_iframe]:max-w-full" />;
}
