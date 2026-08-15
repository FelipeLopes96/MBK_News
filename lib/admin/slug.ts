/**
 * Módulo sem dependências de propósito: o formulário do painel é um Client
 * Component e precisa do mesmo slug que o servidor vai gravar, para mostrar em
 * tempo real como o endereço da matéria vai ficar.
 */

/** "Zebra no UFC: Salkilld finaliza Gamrot" -> "zebra-no-ufc-salkilld-finaliza-gamrot" */
export function gerarSlug(texto: string): string {
  return (
    texto
      .normalize("NFD")
      // Descarta os acentos que o NFD separou da letra — "ç" vira "c", "ã" vira
      // "a". Sem isso o acento solto viraria hífen na troca seguinte.
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
