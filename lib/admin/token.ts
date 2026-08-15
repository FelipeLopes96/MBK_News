import crypto from "node:crypto";

/**
 * Assinatura do cookie de sessão do painel, isolada do resto porque o
 * `proxy.ts` também precisa dela — e a doc do Next pede que o proxy não
 * dependa de módulos compartilhados com o código de renderização. Aqui não há
 * nada além de `node:crypto`.
 */

export const COOKIE_DA_SESSAO = "corner_admin";

/** Uma semana. Renovada a cada login, não a cada requisição. */
const DURACAO_EM_MS = 7 * 24 * 60 * 60 * 1000;

function segredo(): string {
  const valor = process.env.ADMIN_SESSION_SECRET;
  if (!valor) {
    throw new Error(
      "ADMIN_SESSION_SECRET não definida — o painel não sobe sem ela."
    );
  }
  return valor;
}

function assinar(payload: string): string {
  return crypto
    .createHmac("sha256", segredo())
    .update(payload)
    .digest("base64url");
}

/**
 * Comparação em tempo constante. Digerimos os dois lados antes porque
 * `timingSafeEqual` estoura quando os buffers têm tamanhos diferentes — e o
 * próprio estouro já vazaria o tamanho do valor correto.
 */
export function iguais(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a).digest();
  const digestB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function criarToken(): { token: string; expiraEm: Date } {
  const expiraEm = new Date(Date.now() + DURACAO_EM_MS);
  const payload = String(expiraEm.getTime());
  return { token: `${payload}.${assinar(payload)}`, expiraEm };
}

/** Assinatura íntegra e prazo em aberto. Qualquer outra coisa é sessão inválida. */
export function tokenValido(token: string | undefined): boolean {
  if (!token) return false;

  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return false;
  if (!iguais(assinatura, assinar(payload))) return false;

  const expiraEm = Number(payload);
  return Number.isFinite(expiraEm) && expiraEm > Date.now();
}
