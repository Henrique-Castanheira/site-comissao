import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { CATEGORIAS, calcular, formatarBRL, ARQUIVO_FONTE } from "./comissoes.js";

document.addEventListener("DOMContentLoaded", () => {
  const saudacaoEl = document.getElementById("saudacao");
  const nomeEl = document.getElementById("nome-usuario");
  const telEl = document.getElementById("numero-usuario");
  const btnSair = document.getElementById("btn-sair");

  // Elementos do simulador
  const formSimulador = document.getElementById("form-simulador");
  const canalSelect = document.getElementById("canal-vendas");
  const camposBox = document.getElementById("campos-dinamicos");
  const rvTotalExibida = document.getElementById("rv-total-exibida");
  const detalhesCalculo = document.getElementById("detalhes-calculo");

  // ---------------------------------------------------------------------------
  // Simulador: toda a regra de cálculo vive em comissoes.js; aqui só há interface.
  // Nada é montado com innerHTML a partir de dados: apenas createElement/textContent.
  // ---------------------------------------------------------------------------

  function categoriaAtual() {
    return CATEGORIAS.find((c) => c.id === canalSelect.value) || CATEGORIAS[0];
  }

  function criarElemento(tag, propriedades = {}, texto) {
    const el = document.createElement(tag);
    Object.assign(el, propriedades);
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  /** Monta os campos da categoria selecionada (somente os necessários). */
  function montarCampos(cat) {
    camposBox.replaceChildren();
    cat.campos.forEach((campo) => {
      const idCampo = `campo-${campo.id}`;
      const wrapper = criarElemento("div", { className: campo.tipo === "checkbox" ? "campo campo-checkbox" : "campo" });
      let entrada;

      if (campo.tipo === "selecao") {
        entrada = criarElemento("select", { id: idCampo });
        entrada.appendChild(criarElemento("option", { value: "" }, "Selecione..."));
        campo.opcoes.forEach((o) => entrada.appendChild(criarElemento("option", { value: o.valor }, o.rotulo)));
      } else if (campo.tipo === "checkbox") {
        entrada = criarElemento("input", { id: idCampo, type: "checkbox" });
      } else {
        entrada = criarElemento("input", { id: idCampo, type: "number", inputMode: "decimal", min: "0", step: "any" });
        if (campo.tipo === "inteiro") {
          entrada.step = "1";
          entrada.inputMode = "numeric";
        }
        if (campo.tipo === "percentual") entrada.max = "100";
        // Sem valores pré-preenchidos: campo vazio = dado ausente (diferente de zero).
      }
      entrada.dataset.campo = campo.id;

      const rotulo = criarElemento("label", { htmlFor: idCampo }, campo.rotulo + (campo.obrigatorio ? "" : " (opcional)"));
      if (campo.tipo === "checkbox") {
        wrapper.append(entrada, rotulo);
      } else {
        wrapper.append(rotulo, entrada);
      }
      if (campo.ajuda) wrapper.appendChild(criarElemento("small", { className: "ajuda" }, campo.ajuda));
      camposBox.appendChild(wrapper);
    });
  }

  /** Lê os valores digitados. Vazio permanece vazio (nunca vira 0 nem 100). */
  function lerEntradas(cat) {
    const entradas = {};
    cat.campos.forEach((campo) => {
      const el = camposBox.querySelector(`[data-campo="${campo.id}"]`);
      if (!el) return;
      entradas[campo.id] = campo.tipo === "checkbox" ? el.checked : el.value;
    });
    return entradas;
  }

  function limparResultado() {
    detalhesCalculo.replaceChildren();
  }

  /** Mostra o resultado (ou os campos que faltam). `explicito` = usuário clicou em Calcular. */
  function mostrarResultado(r, explicito) {
    limparResultado();

    if (!r.ok) {
      rvTotalExibida.textContent = "R$ 0,00";
      const lista = criarElemento("ul", { className: "msg-preencher" + (explicito ? " erro" : "") });
      r.erros.forEach((e) => lista.appendChild(criarElemento("li", {}, e)));
      detalhesCalculo.append(
        criarElemento("div", { className: "nota-simulador" }, explicito ? "Verifique os valores informados:" : "Preencha os campos para ver a estimativa:"),
        lista
      );
      return;
    }

    rvTotalExibida.textContent = formatarBRL(r.rvTotal);

    if (r.parcial) {
      detalhesCalculo.appendChild(
        criarElemento("div", { className: "banner-parcial" }, "Resultado parcial: esta simulação NÃO contempla todas as regras do documento (veja o aviso abaixo).")
      );
    }

    // Componentes aplicáveis (base, acelerador, adicionais...). Total = soma exata.
    if (r.componentes.length) {
      const ul = criarElemento("ul", { className: "lista-componentes" });
      r.componentes.forEach((c) => {
        const li = criarElemento("li");
        li.append(criarElemento("span", {}, c.rotulo), criarElemento("strong", {}, formatarBRL(c.valor)));
        ul.appendChild(li);
      });
      detalhesCalculo.appendChild(ul);
    }

    if (r.avisos.length) {
      const ul = criarElemento("ul", { className: "lista-avisos" });
      r.avisos.forEach((a) => ul.appendChild(criarElemento("li", {}, a)));
      detalhesCalculo.appendChild(ul);
    }

    const memoria = criarElemento("details", { className: "memoria", open: true });
    memoria.appendChild(criarElemento("summary", {}, "Memória de cálculo"));
    const ol = criarElemento("ol");
    r.memoria.forEach((linha) => ol.appendChild(criarElemento("li", {}, linha)));
    memoria.appendChild(ol);
    detalhesCalculo.appendChild(memoria);

    detalhesCalculo.appendChild(
      criarElemento("div", { className: "fonte-simulador" }, `Fonte: ${ARQUIVO_FONTE}, p. ${r.paginaPdf}.`)
    );
  }

  function executarCalculoSimulacao(explicito = false) {
    const cat = categoriaAtual();
    try {
      mostrarResultado(calcular(cat.id, lerEntradas(cat)), explicito);
    } catch (err) {
      console.error("Erro ao calcular comissão:", err);
      rvTotalExibida.textContent = "R$ 0,00";
      limparResultado();
      detalhesCalculo.appendChild(criarElemento("div", { className: "nota-simulador" }, "Não foi possível calcular. Verifique os valores informados."));
    }
  }

  function trocarCategoria() {
    montarCampos(categoriaAtual());
    executarCalculoSimulacao(false);
  }

  if (canalSelect && camposBox && formSimulador) {
    CATEGORIAS.forEach((c) => canalSelect.appendChild(criarElemento("option", { value: c.id }, c.rotulo)));
    canalSelect.addEventListener("change", trocarCategoria);

    // Recalcula quando qualquer dado muda; o submit nunca recarrega a página.
    camposBox.addEventListener("input", () => executarCalculoSimulacao(false));
    camposBox.addEventListener("change", () => executarCalculoSimulacao(false));
    formSimulador.addEventListener("submit", (e) => {
      e.preventDefault();
      executarCalculoSimulacao(true);
    });

    trocarCategoria();
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
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      document.body.classList.add("autenticado");
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
