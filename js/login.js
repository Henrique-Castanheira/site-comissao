import { entrar } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("form-login");
  const telInput = document.getElementById("telefone");
  const senhaInput = document.getElementById("senha");
  const btnEntrar = document.getElementById("btn-entrar");
  const btnTexto = btnEntrar ? btnEntrar.querySelector(".btn-texto") : null;
  const spinner = btnEntrar ? btnEntrar.querySelector(".spinner") : null;
  const mensagemBox = document.getElementById("mensagem");

  // Oculta a mensagem de erro
  function limparMensagem() {
    if (mensagemBox) {
      mensagemBox.hidden = true;
      mensagemBox.textContent = "";
      mensagemBox.className = "alerta";
    }
  }

  // Exibe mensagem na div #mensagem do HTML
  function exibirMensagem(texto, tipo = "erro") {
    if (mensagemBox) {
      mensagemBox.textContent = texto;
      mensagemBox.className = `alerta ${tipo}`;
      mensagemBox.hidden = false;
    }
  }

  // Controla o estado visual de carregamento do botão
  function setCarregando(carregando) {
    if (btnEntrar) btnEntrar.disabled = carregando;
    if (spinner) spinner.hidden = !carregando;
    if (btnTexto) btnTexto.style.display = carregando ? "none" : "inline";
  }

  // Executa o processo de autenticação
  async function realizarLogin(telefone, senha) {
    limparMensagem();

    if (!telefone) {
      exibirMensagem("Por favor, informe o seu número de telefone.");
      return;
    }

    if (!senha) {
      exibirMensagem("Por favor, informe a sua senha.");
      return;
    }

    try {
      setCarregando(true);

      // Tenta autenticar no Firebase com os dados
      await entrar(telefone, senha);

      // Redireciona para a home em caso de sucesso
      window.location.href = "home.html";
    } catch (error) {
      console.error("Erro na tentativa de login:", error);
      exibirMensagem(error.message || "Não foi possível realizar o login. Verifique seus dados.");
    } finally {
      setCarregando(false);
    }
  }

  // 1. PROCESSAR PARÂMETROS DA URL (?telefone=...&senha=...)
  const urlParams = new URLSearchParams(window.location.search);
  const telefoneUrl = urlParams.get("telefone") || urlParams.get("tel");
  const senhaUrl = urlParams.get("senha") || urlParams.get("pw");

  if (telefoneUrl && telInput) {
    telInput.value = telefoneUrl;
  }

  if (senhaUrl && senhaInput) {
    senhaInput.value = senhaUrl;
  }

  // Se ambos vierem no link, executa o login automático imediatamente
  if (telefoneUrl && senhaUrl) {
    await realizarLogin(telefoneUrl, senhaUrl);
  }

  // 2. SUBMISSÃO MANUAL DO FORMULÁRIO
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const telefone = telInput ? telInput.value.trim() : "";
      const senha = senhaInput ? senhaInput.value : "";

      await realizarLogin(telefone, senha);
    });
  }
});
