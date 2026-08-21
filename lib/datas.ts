/**
 * Formatação de data, isolada de propósito.
 *
 * O formatador estava duplicado em `lib/conteudo.ts` e `lib/noticias.ts`, que
 * leem disco — então qualquer componente de cliente que precisasse formatar uma
 * data arrastava `node:fs` para o bundle do navegador. Aqui não há dependência
 * nenhuma, e os dois módulos passam a reexportar daqui.
 */

const formatadorDeData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  // As datas do conteúdo são ISO sem hora; sem fixar UTC, o fuso local
  // empurraria a data um dia para trás em parte do mundo.
  timeZone: "UTC",
});

/** "2026-08-14" -> "14 de agosto de 2026" */
export function formatarData(data: string): string {
  return formatadorDeData.format(new Date(data));
}
