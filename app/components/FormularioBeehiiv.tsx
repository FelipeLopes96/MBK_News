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

  // O loader monta <div style="overflow:hidden;height:0"><iframe style="height:2000px">
  // e conta com uma mensagem `beehiiv:styles` vinda de dentro do iframe para
  // ajustar as duas alturas. Essa mensagem nunca chega neste formulário: o
  // wrapper fica em 0 (o form some) e o iframe fica nos 2000px iniciais (o
  // vazio branco). Como os estilos do loader são inline, só sobrescrevemos com
  // `!`. Alturas fixas porque, sem a mensagem, não há como saber a real.
  return (
    <div
      ref={container}
      className={[
        "mt-6",
        // Reabre os wrappers que o loader colapsou — são dois divs aninhados,
        // e é o de dentro que fica com height:0.
        "[&_div]:h-auto! [&_div]:overflow-visible!",
        // Altura do iframe. Medidas do conteúdo real: ~223px no card estreito
        // e ~215px no largo; o resto é folga. Se o layout do formulário mudar
        // no Beehiiv (ex.: campo acima do botão), reveja estes dois valores.
        "[&_iframe]:h-[280px]! @sm:[&_iframe]:h-[240px]!",
        "[&_iframe]:w-full! [&_iframe]:max-w-full",
      ].join(" ")}
    />
  );
}
