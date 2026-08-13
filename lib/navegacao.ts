export type ItemDeNavegacao = { href: string; rotulo: string };

/**
 * Sub-seções do Arquivo, na ordem em que aparecem na navegação.
 *
 * Vive aqui, e não em `lib/arquivo.ts`, porque tanto o menu mobile quanto a
 * barra da seção rodam no cliente: importar `lib/arquivo.ts` arrastaria a
 * leitura de disco (`fs`) para o bundle do navegador.
 */
export const secoesDoArquivo: ItemDeNavegacao[] = [
  { href: "/arquivo/organizacoes", rotulo: "Organizações" },
  { href: "/arquivo/lendas", rotulo: "Lendas" },
  { href: "/arquivo/momentos", rotulo: "Momentos" },
];
