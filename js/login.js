import { entrar } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector("form") || document.getElementById("form-login");
  const btnSubmit = document.querySelector('button[type="submit"]') || document.getElementById("btn-entrar");
  
  const telInput = document.getElementById("telefone") || document.getElementById("tel") || document.querySelector('input[type="tel"]') || document.querySelectorAll("input")[0];
  const senhaInput = document.getElementById("senha") || document.querySelector('input[type="password"]');

  // Função para exibir mensagem na caixa de erro
  function mostrarErro(mensagem) {
    let boxErro = document.querySelector(".alerta.erro") || document.querySelector(".alert-danger") || document.querySelector('[class*="erro"]');
    if (!boxErro && form) {
      boxErro = document.createElement("div");
      boxErro.className = "alerta erro";
      form.prepend(boxErro);
    }
    if (boxErro) {
      boxErro.textContent = mensagem;
      boxErro.style.display = "block";
    }
  }

  function limparErro() {
    const boxErro = document.querySelector(".alerta.erro") || document.querySelector(".alert-danger") || document.querySelector('[class*="erro"]');
    if (boxErro) {
      boxErro.style.display = "none";
      boxErro.textContent = "";
    }
  }

  // Função genérica de Login
  async function executarLogin(telefone, senha) {
    limparErro();
    try {
      if (btnSubmit) btnSubmit.disabled = true;

      // Chama a função de autenticação do Firebase
      await entrar(telefone, senha);

      // Sucesso: Redireciona para a página home.html
      window.location.href = "home.html";
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      mostrarErro(error.message || "Erro ao fazer login. Verifique o telefone e a senha.");
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  }

  // 1. VERIFICA PARÂMETROS NA URL (?telefone=...&senha=...)
  const urlParams = new URLSearchParams(window.location.search);
  const telUrl = urlParams.get("telefone") || urlParams.get("tel");
  const senhaUrl = urlParams.get("senha") || urlParams.get("pw");

  if (telUrl) {
    if (telInput) telInput.value = telUrl;
  }

  if (senhaUrl) {
    if (senhaInput) senhaInput.value = senhaUrl;
  }

  // Se ambos vierem na URL, executa o login automático
  if (telUrl && senhaUrl) {
    await executarLogin(telUrl, senhaUrl);
  }

  // 2. SUBMISSÃO MANUAL DO FORMULÁRIO
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const telefone = telInput ? telInput.value.trim() : "";
      const senha = senhaInput ? senhaInput.value : "";

      if (!telefone) {
        mostrarErro("Por favor, digite o número de telefone.");
        return;
      }

      if (!senha) {
        mostrarErro("Por favor, digite a sua senha.");
        return;
      }

      await executarLogin(telefone, senha);
    });
  }
});
