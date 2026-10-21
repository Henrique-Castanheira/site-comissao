import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { 
  calcularComissaoPAP, 
  calcularComissaoDigital, 
  calcularComissaoLider, 
  calcularComissaoExecutivo 
} from "./comissoes.js";

document.addEventListener("DOMContentLoaded", () => {
  const saudacaoEl = document.getElementById("saudacao");
  const telEl = document.getElementById("numero-usuario");
  const btnSair = document.getElementById("btn-sair");

  const canalSelect = document.getElementById("canal-vendas");
  const vendaInput = document.getElementById("venda-instalada");
  const metaInput = document.getElementById("meta-mes");
  const chkNovoColaborador = document.getElementById("chk-novo-colaborador");
  const boxMeta = document.getElementById("box-meta");
  const boxNovoColaborador = document.getElementById("box-novo-colaborador");
  
  const btnCalcular = document.getElementById("btn-calcular");
  const rvTotalExibida = document.getElementById("rv-total-exibida");
  const detalhesCalculo = document.getElementById("detalhes-calculo");

  const boxNotificacao = document.getElementById("box-notificacao");
  const textoNotificacao = document.getElementById("texto-notificacao");
  const btnWhatsapp = document.getElementById("btn-whatsapp");

  function executarSimulacao() {
    const canal = canalSelect.value;
    const venda = parseFloat(vendaInput.value) || 0;
    const meta = parseFloat(metaInput.value) || 0;
    const ehNovo = chkNovoColaborador.checked;

    let res = { rvTotal: 0 };
    let detalhe = "";
    let textoDica = "";
    let msgZap = "";

    if (canal === "pap" || canal === "callcenter") {
      res = calcularComissaoPAP(venda, ehNovo);
      detalhe = `Você está no fator de comissão: ${(res.fator * 100).toFixed(0)}%`;

      if (res.faltaParaProxima > 0) {
        textoDica = `💡 <b>Fique atento!</b> Você está no fator <b>${res.fator}</b>. Faltam apenas <b>R$ ${res.faltaParaProxima.toFixed(2)}</b> em vendas para você mudar de fator e subir sua comissão para <b>R$ ${res.ganhoEstimadoProxima.toFixed(2)}</b>!`;
        msgZap = `Aviso de comissão: Você está no fator de comissão ${res.fator}! Faltam apenas R$ ${res.faltaParaProxima.toFixed(2)} para você mudar de faixa! Vamos pra cima! 🚀`;
      }
    } else if (canal === "digital") {
      res = calcularComissaoDigital(venda, ehNovo);
      detalhe = `Fator atual: ${(res.fator * 100).toFixed(0)}%`;

      if (res.faltaParaProxima > 0) {
        textoDica = `💡 Faltam <b>R$ ${res.faltaParaProxima.toFixed(2)}</b> para você atingir a próxima faixa de comissão!`;
        msgZap = `Você está quase lá! Faltam apenas R$ ${res.faltaParaProxima.toFixed(2)} para subir a comissão do seu canal digital!`;
      }
    } else if (canal === "lider" || canal === "executivo") {
      res = canal === "lider" ? calcularComissaoLider(meta, venda) : calcularComissaoExecutivo(meta, venda);
      detalhe = `Atingimento da Meta: ${res.pctAtingimento.toFixed(1)}%`;

      if (res.faltaMeta > 0) {
        textoDica = `🔥 Faltam <b>R$ ${res.faltaMeta.toFixed(2)}</b> em vendas para alcançar 100% da meta!`;
        msgZap = `Atenção: Faltam apenas R$ ${res.faltaMeta.toFixed(2)} de vendas para bater 100% da meta!`;
      }
    }

    if (res.aplicouPiso) {
      detalhe += " (Garantido o piso de R$ 300,00 para novos colaboradores)";
    }

    rvTotalExibida.textContent = res.rvTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    detalhesCalculo.textContent = detalhe;

    if (textoDica) {
      textoNotificacao.innerHTML = textoDica;
      boxNotificacao.style.display = "block";
      if (msgZap) {
        btnWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(msgZap)}`;
        btnWhatsapp.style.display = "inline-block";
      } else {
        btnWhatsapp.style.display = "none";
      }
    } else {
      boxNotificacao.style.display = "none";
    }
  }

  canalSelect.addEventListener("change", () => {
    const canal = canalSelect.value;
    if (canal === "lider" || canal === "executivo") {
      boxMeta.style.display = "block";
      boxNovoColaborador.style.display = "none";
    } else {
      boxMeta.style.display = "none";
      boxNovoColaborador.style.display = "block";
    }
    executarSimulacao();
  });

  btnCalcular.addEventListener("click", executarSimulacao);

  onAuthStateChanged(auth, async (user) => {
    if (!user) { window.location.href = "index.html"; return; }
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
      if (telEl) telEl.textContent = telefone;

      document.body.classList.add("autenticado");
      executarSimulacao();
    } catch (e) {
      document.body.classList.add("autenticado");
      executarSimulacao();
    }
  });

  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
});
