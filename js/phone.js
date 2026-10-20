/**
 * Normalização e validação de telefones (formato E.164).
 *
 * Funções puras, sem dependência do navegador, para facilitar testes.
 * Validar o formato NÃO prova que o número pertence ao usuário.
 */
import { CODIGO_PAIS_PADRAO, DOMINIO_EMAIL_SINTETICO } from "./firebase-config.js";

const E164 = /^\+[1-9]\d{7,14}$/;

/**
 * Converte a entrada do usuário em E.164 ou retorna null se for inválida.
 *
 * Regras:
 *  - "+..." : usa o número como digitado (só dígitos após o "+").
 *  - 10 ou 11 dígitos: assume o país padrão (Brasil).
 *  - 12 ou 13 dígitos começando com o código do país padrão: acrescenta "+".
 *  - Números brasileiros (+55): DDD 11–99 e, com 9 dígitos, o primeiro deve ser 9.
 */
export function normalizarTelefone(entrada) {
  if (typeof entrada !== "string") return null;
  const texto = entrada.trim();
  if (!texto) return null;

  // Rejeita letras e símbolos inesperados (permite espaços, (), - e .).
  if (!/^\+?[\d\s().-]+$/.test(texto)) return null;

  const digitos = texto.replace(/\D/g, "");
  let e164;

  if (texto.startsWith("+")) {
    e164 = "+" + digitos;
  } else if (digitos.length === 10 || digitos.length === 11) {
    e164 = "+" + CODIGO_PAIS_PADRAO + digitos;
  } else if (
    (digitos.length === 12 || digitos.length === 13) &&
    digitos.startsWith(CODIGO_PAIS_PADRAO)
  ) {
    e164 = "+" + digitos;
  } else {
    return null;
  }

  if (!E164.test(e164)) return null;

  if (e164.startsWith("+55")) {
    const nacional = e164.slice(3);
    if (nacional.length !== 10 && nacional.length !== 11) return null;
    const ddd = Number(nacional.slice(0, 2));
    if (ddd < 11 || ddd > 99) return null;
    if (nacional.length === 11 && nacional[2] !== "9") return null;
  }

  return e164;
}

/**
 * E-mail sintético determinístico que representa o telefone no Firebase Auth.
 * Ex.: "+5511999999999" -> "5511999999999@phone.invalid"
 */
export function telefoneParaEmail(e164) {
  return e164.replace(/^\+/, "") + "@" + DOMINIO_EMAIL_SINTETICO;
}
