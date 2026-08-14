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
  // ajustar as duas alturas. Essa mensagem nunca chega neste formulário, então
  // dimensionamos pelo tamanho real do conteúdo, medido no próprio formulário.
  //
  // O <form> vem do Beehiiv com `width: max-content; max-width: 100%` dentro de
  // um <body> `display: block`, sem centralização. Ou seja: ele não acompanha a
  // largura do iframe — fica com a largura natural do conteúdo (212px) colado
  // na borda esquerda. Por isso o iframe recebe exatamente essa largura e é
  // centralizado aqui: assim o formulário ocupa o iframe inteiro e fica no meio
  // do card, sem precisar mexer em nada de dentro do iframe.
  //
  // O `max-w-full` mantém o comportamento em cards mais estreitos que 212px:
  // como o form tem `max-width: 100%`, ele encolhe junto e continua preenchendo.
  // As classes precisam ser literais: o Tailwind varre o código-fonte e não
  // enxerga nome de classe montado por interpolação.
  return (
    <div
      ref={container}
      className={[
        "mt-6",
        // Reabre os wrappers que o loader colapsou — são dois divs aninhados,
        // e é o de dentro que fica com height:0.
        "[&_div]:h-auto! [&_div]:overflow-visible!",
        // 212px = largura natural do form. 160px = os 152px medidos do
        // conteúdo vertical (campo + gap + botão) com 8px de folga.
        "[&_iframe]:w-[212px]! [&_iframe]:h-[160px]!",
        "[&_iframe]:mx-auto! [&_iframe]:max-w-full",
      ].join(" ")}
    />
  );
}
