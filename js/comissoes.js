/**
 * Módulo de Cálculo de Remuneração Variável - Terra Fibra (Outubro 2026)
 */

// 1. Calculadora para Consultor PAP[cite: 12]
export function calcularComissaoPAP(vendaTotal, possuiVendaMovel = false, indiceQualidade = 100) {
  let fator = 0;
  if (vendaTotal >= 4001) fator = 1.10;
  else if (vendaTotal >= 3001) fator = 0.90;
  else if (vendaTotal >= 2001) fator = 0.75;
  else if (vendaTotal >= 1000) fator = 0.40;

  let rvBase = vendaTotal * fator;

  // Acelerador de Qualidade[cite: 12]
  let pctAcelerador = 0;
  if (indiceQualidade > 90) pctAcelerador = 0.10;
  else if (indiceQualidade > 85) pctAcelerador = 0.07;
  else if (indiceQualidade > 80) pctAcelerador = 0.05;

  let valorAcelerador = rvBase * pctAcelerador;
  let rvTotal = rvBase + valorAcelerador;

  return { rvBase, valorAcelerador, rvTotal, fator, pctAcelerador };
}

// 2. Calculadora para Consultor Call Center[cite: 15]
export function calcularComissaoCallCenter(vendaTotal, possuiVendaMovel = false, indiceQualidade = 100) {
  return calcularComissaoPAP(vendaTotal, possuiVendaMovel, indiceQualidade); // Mesmas faixas e aceleradores[cite: 12, 15]
}

// 3. Calculadora para Consultor Digital[cite: 19]
export function calcularComissaoDigital(vendaTotal, indiceQualidade = 100) {
  let fator = 0;
  if (vendaTotal > 12000) fator = 0.15;
  else if (vendaTotal >= 9501) fator = 0.13;
  else if (vendaTotal >= 8501) fator = 0.12;
  else if (vendaTotal >= 7001) fator = 0.11;
  else if (vendaTotal >= 0.01) fator = 0.10;

  let rvBase = vendaTotal * fator;

  let pctAcelerador = 0;
  if (indiceQualidade > 90) pctAcelerador = 0.10;
  else if (indiceQualidade > 85) pctAcelerador = 0.07;
  else if (indiceQualidade > 80) pctAcelerador = 0.05;

  let valorAcelerador = rvBase * pctAcelerador;
  let rvTotal = rvBase + valorAcelerador;

  return { rvBase, valorAcelerador, rvTotal, fator, pctAcelerador };
}

// 4. Calculadora para Líderes (PAP / Call Center / Digital)[cite: 13, 16, 21]
export function calcularComissaoLider(meta, receitaInstalada) {
  if (!meta || meta <= 0) return { pctAtingimento: 0, rvTotal: 0 };

  const pctAtingimento = (receitaInstalada / meta) * 100;
  let rvTotal = 0;

  if (pctAtingimento >= 100) {
    rvTotal = 1000;
    // A cada 5% acima de 100%, soma R$ 200 (limite 140%)[cite: 16, 21]
    const pctExcedente = Math.min(pctAtingimento, 140) - 100;
    const blocosCincoPct = Math.floor(pctExcedente / 5);
    rvTotal += blocosCincoPct * 200;
  } else if (pctAtingimento >= 80) {
    rvTotal = 600; //[cite: 13, 21] (85% para Call Center[cite: 16])
  }

  return { pctAtingimento, rvTotal };
}

// 5. Calculadora para Executivo de Vendas[cite: 23]
export function calcularComissaoExecutivo(meta, receitaInstalada) {
  if (!meta || meta <= 0) return { pctAtingimento: 0, rvTotal: 0, fator: 0 };

  const pctAtingimento = (receitaInstalada / meta) * 100;
  let fator = 0;

  if (pctAtingimento >= 100) fator = 0.07;
  else if (pctAtingimento >= 90) fator = 0.06;
  else if (pctAtingimento >= 80) fator = 0.05;

  const rvTotal = receitaInstalada * fator;
  return { pctAtingimento, fator, rvTotal };
}

// 6. Calculadora Casa Conectada[cite: 27]
export function calcularCasaConectada(valorVenda, cargo) {
  const fatores = {
    "consultor_loja": 0.16,
    "consultor_pap": 0.16,
    "consultor_digital": 0.20,
    "lider_callcenter": 0.10,
    "lider_pap": 0.05,
    "executivo_vendas": 0.03,
    "gerente_comercial": 0.02
  };

  const fator = fatores[cargo] || 0;
  return valorVenda * fator;
}
