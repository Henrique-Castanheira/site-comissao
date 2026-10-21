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

  // Elementos da Calculadora
  const canalSelect = document.getElementById("canal-vendas");
  const vendaInput = document.getElementById("venda-instalada");
  const metaInput = document.getElementById("meta-mes");
  const qualidadeInput = document.getElementById("indice-qualidade");
  const boxMeta = document.getElementById("box-meta");
  const boxQualidade = document.getElementById("box-qualidade");
  const btnCalcular = document.getElementById("btn-calcular");
  const rvTotalExibida = document.getElementById("rv-total-exibida");
  const detalhesCalculo = document.getElementById("detalhes-calculo");

  // Função principal de cálculo do simulador
  function executarCalculoSimulacao() {
    if (!canalSelect || !rvTotalExibida) return;

    const canal = canalSelect.value;
    const venda = parseFloat(vendaInput ? vendaInput.value : 0) || 0;
    const meta = parseFloat(metaInput ? metaInput.value : 0) || 0;
    const qualidade = parseFloat(qualidadeInput ? qualidadeInput.value : 100) || 100;

    let resultado = { rvTotal: 0 };
    let textoDetalhes = "";

    try {
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

      const valorFormatado = (resultado.rvTotal || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

      rvTotalExibida.textContent = valorFormatado;
      if (detalhesCalculo) detalhesCalculo.textContent = textoDetalhes;
    } catch (err) {
      console.error("Erro ao calcular comissão:", err);
      rvTotalExibida.textContent = "R$ 0,00";
      if (detalhesCalculo) detalhesCalculo.textContent = "Verifique os valores informados.";
    }
  }

  // Alternância visual de campos
  if (canalSelect) {
    canalSelect.addEventListener("change", () => {
      const canal = canalSelect.value;
      if (canal === "lider" || canal === "executivo") {
        if (boxMeta) boxMeta.style.display = "block";
        if (boxQualidade) boxQualidade.style.display = "none";
      } else {
        if (boxMeta) boxMeta.style.display = "none";
        if (boxQualidade) boxQualidade.style.display = "block";
      }
      executarCalculoSimulacao();
    });
  }

  // Ação do Botão Calcular
  if (btnCalcular) {
    btnCalcular.addEventListener("click", (e) => {
      e.preventDefault();
      executarCalculoSimulacao();
    });
  }

  // 1. Validação de Sessão com o Firebase
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
      executarCalculoSimulacao(); // Calcula automaticamente ao abrir a tela
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      document.body.classList.add("autenticado");
      executarCalculoSimulacao();
    }
  });

  // Logout
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});
