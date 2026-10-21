import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { 
  calcularComissaoPAP, 
  calcularComissaoCallCenter, 
  calcularComissaoDigital, 
  calcularComissaoLider, 
  calcularComissaoExecutivo 
} from "./comissoes.js";

document.addEventListener("DOMContentLoaded", () => {
  const saudacaoEl = document.getElementById("saudacao");
  const nomeEl = document.getElementById("nome-usuario");
  const telEl = document.getElementById("numero-usuario");
  const btnSair = document.getElementById("btn-sair");

  // Elementos do Simulador
  const canalSelect = document.getElementById("canal-vendas");
  const vendaInput = document.getElementById("venda-instalada");
  const metaInput = document.getElementById("meta-mes");
  const qualidadeInput = document.getElementById("indice-qualidade");
  const boxMeta = document.getElementById("box-meta");
  const boxQualidade = document.getElementById("box-qualidade");
  const btnCalcular = document.getElementById("btn-calcular");
  const rvTotalExibida = document.getElementById("rv-total-exibida");
  const detalhesCalculo = document.getElementById("detalhes-calculo");

  // 1. Validação de Sessão
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      let nome = user.displayName || "Usuário";
      let telefone = user.phoneNumber || "Não informado";

      if (docSnap.exists()) {
        const dados = docSnap.data();
        if (dados.displayName) nome = dados.displayName;
        if (dados.phoneNumber) telefone = dados.phoneNumber;
      }

      if (saudacaoEl) saudacaoEl.textContent = `Olá, ${nome.split(" ")[0]}!`;
      if (nomeEl) nomeEl.textContent = nome;
      if (telEl) telEl.textContent = telefone;

      document.body.classList.add("autenticado");
      executarCalculoSimulacao(); // Executa o cálculo inicial
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      document.body.classList.add("autenticado");
    }
  });

  // 2. Alternância de campos conforme o canal selecionado
  canalSelect.addEventListener("change", () => {
    const canal = canalSelect.value;
    if (canal === "lider" || canal === "executivo") {
      boxMeta.style.display = "block";
      boxQualidade.style.display = "none";
    } else {
      boxMeta.style.display = "none";
      boxQualidade.style.display = "block";
    }
    executarCalculoSimulacao();
  });

  // 3. Execução da Simulação
  function executarCalculoSimulacao() {
    const canal = canalSelect.value;
    const venda = parseFloat(vendaInput.value) || 0;
    const meta = parseFloat(metaInput.value) || 0;
    const qualidade = parseFloat(qualidadeInput.value) || 0;

    let resultado = { rvTotal: 0 };
    let textoDetalhes = "";

    if (canal === "pap") {
      resultado = calcularComissaoPAP(venda, true, qualidade);
      textoDetalhes = `Fator: ${resultado.fator} | Acelerador Qualidade: R$ ${resultado.valorAcelerador.toFixed(2)}`;
    } else if (canal === "callcenter") {
      resultado = calcularComissaoCallCenter(venda, true, qualidade);
      textoDetalhes = `Fator: ${resultado.fator} | Acelerador Qualidade: R$ ${resultado.valorAcelerador.toFixed(2)}`;
    } else if (canal === "digital") {
      resultado = calcularComissaoDigital(venda, qualidade);
      textoDetalhes = `Fator: ${resultado.fator} | Acelerador Qualidade: R$ ${resultado.valorAcelerador.toFixed(2)}`;
    } else if (canal === "lider") {
      resultado = calcularComissaoLider(meta, venda);
      textoDetalhes = `Atingimento da Meta: ${resultado.pctAtingimento.toFixed(1)}%`;
    } else if (canal === "executivo") {
      resultado = calcularComissaoExecutivo(meta, venda);
      textoDetalhes = `Atingimento: ${resultado.pctAtingimento.toFixed(1)}% | Fator: ${resultado.fator}`;
    }

    rvTotalExibida.textContent = `R$ ${resultado.rvTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    detalhesCalculo.textContent = textoDetalhes;
  }

  btnCalcular.addEventListener("click", executarCalculoSimulacao);

  // 4. Logout
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});
