
export function calcularComissaoPAP(vendaTotal, novoColaborador = false) {
  let fator = 0;
  let proximaFaixaValor = null;
  let proximaFaixaFator = null;

  if (vendaTotal >= 4001) {
    fator = 1.10;
  } else if (vendaTotal >= 3001) {
    fator = 0.90;
    proximaFaixaValor = 4001;
    proximaFaixaFator = 1.10;
  } else if (vendaTotal >= 2001) {
    fator = 0.75;
    proximaFaixaValor = 3001;
    proximaFaixaFator = 0.90;
  } else if (vendaTotal >= 1000) {
    fator = 0.40;
    proximaFaixaValor = 2001;
    proximaFaixaFator = 0.75;
  } else {
    proximaFaixaValor = 1000;
    proximaFaixaFator = 0.40;
  }

  let rvCalculada = vendaTotal * fator;
  let rvTotal = rvCalculada;
  let aplicouPiso = false;
  if (novoColaborador && rvCalculada < 300 && vendaTotal > 0) {
    rvTotal = 300;
    aplicouPiso = true;
  }

  let faltaParaProxima = proximaFaixaValor ? proximaFaixaValor - vendaTotal : 0;
  let ganhoEstimadoProxima = proximaFaixaValor ? (proximaFaixaValor * proximaFaixaFator) : 0;

  return { 
    rvTotal, 
    rvCalculada, 
    fator, 
    proximaFaixaValor, 
    proximaFaixaFator, 
    faltaParaProxima, 
    ganhoEstimadoProxima,
    aplicouPiso 
  };
}

// Consultor Digital[cite: 19]
export function calcularComissaoDigital(vendaTotal, novoColaborador = false) {
  let fator = 0;
  let proximaFaixaValor = null;
  let proximaFaixaFator = null;

  if (vendaTotal > 12000) {
    fator = 0.15;
  } else if (vendaTotal >= 9501) {
    fator = 0.13;
    proximaFaixaValor = 12001;
    proximaFaixaFator = 0.15;
  } else if (vendaTotal >= 8501) {
    fator = 0.12;
    proximaFaixaValor = 9501;
    proximaFaixaFator = 0.13;
  } else if (vendaTotal >= 7001) {
    fator = 0.11;
    proximaFaixaValor = 8501;
    proximaFaixaFator = 0.12;
  } else if (vendaTotal >= 0.01) {
    fator = 0.10;
    proximaFaixaValor = 7001;
    proximaFaixaFator = 0.11;
  }

  let rvCalculada = vendaTotal * fator;
  let rvTotal = rvCalculada;
  let aplicouPiso = false;

  if (novoColaborador && rvCalculada < 300 && vendaTotal > 0) {
    rvTotal = 300;
    aplicouPiso = true;
  }

  let faltaParaProxima = proximaFaixaValor ? proximaFaixaValor - vendaTotal : 0;
  let ganhoEstimadoProxima = proximaFaixaValor ? (proximaFaixaValor * proximaFaixaFator) : 0;

  return { 
    rvTotal, 
    fator, 
    faltaParaProxima, 
    ganhoEstimadoProxima, 
    proximaFaixaValor, 
    proximaFaixaFator,
    aplicouPiso 
  };
}

// Líderes[cite: 13, 16, 21]
export function calcularComissaoLider(meta, receitaInstalada) {
  if (!meta || meta <= 0) return { pctAtingimento: 0, rvTotal: 0, faltaParaProxima: 0 };

  const pctAtingimento = (receitaInstalada / meta) * 100;
  let rvTotal = 0;

  if (pctAtingimento >= 100) {
    rvTotal = 1000;
    const pctExcedente = Math.min(pctAtingimento, 140) - 100;
    const blocosCincoPct = Math.floor(pctExcedente / 5);
    rvTotal += blocosCincoPct * 200;
  } else if (pctAtingimento >= 80) {
    rvTotal = 600;
  }

  const faltaMeta = Math.max(0, meta - receitaInstalada);

  return { pctAtingimento, rvTotal, faltaMeta };
}

export function calcularComissaoExecutivo(meta, receitaInstalada) {
  if (!meta || meta <= 0) return { pctAtingimento: 0, rvTotal: 0, fator: 0 };

  const pctAtingimento = (receitaInstalada / meta) * 100;
  let fator = 0;

  if (pctAtingimento >= 100) fator = 0.07;
  else if (pctAtingimento >= 90) fator = 0.06;
  else if (pctAtingimento >= 80) fator = 0.05;

  const rvTotal = receitaInstalada * fator;
  const faltaMeta = Math.max(0, meta - receitaInstalada);

  return { pctAtingimento, fator, rvTotal, faltaMeta };
}
