/**
 * Normaliza o telefone digitado para o formato internacional (+5511999999999)
 */
export function normalizarTelefone(telefone) {
  if (!telefone) return "";
  
  // Remove todos os caracteres não numéricos, exceto o '+' se já existir no início
  let limpo = telefone.trim().replace(/[^\d+]/g, "");

  if (!limpo) return "";

  // Se começou com +, mantém o número
  if (limpo.startsWith("+")) {
    return limpo;
  }

  // Remove o '0' do DDD se o usuário digitou (ex: 019991490901 -> 19991490901)
  if (limpo.length === 12 && limpo.startsWith("0")) {
    limpo = limpo.slice(1);
  }

  // Se tiver 10 ou 11 dígitos (com DDD), adiciona o código do Brasil +55
  if (limpo.length === 10 || limpo.length === 11) {
    return "+55" + limpo;
  }

  return limpo;
}

/**
 * Converte o telefone normalizado em um e-mail fictício para uso no Firebase Auth
 */
export function telefoneParaEmail(telefone) {
  const norm = normalizarTelefone(telefone);
  if (!norm) return "";
  
  // Remove o '+' para criar o prefixo do e-mail (ex: 5519991490901@phone.invalid)
  const apenasNumeros = norm.replace("+", "");
  return `${apenasNumeros}@phone.invalid`;
}
