import { cadastrar } from "./auth.js";

const form = document.querySelector("form") || document.getElementById("form-cadastro");
const btnSubmit = document.querySelector('button[type="submit"]') || document.getElementById("btn-cadastrar");

// Função para exibir mensagem na caixa vermelha de erro
function mostrarErro(mensagem) {
  let boxErro = document.querySelector(".alert-danger") || document.querySelector('[class*="erro"]');
  if (!boxErro) {
    boxErro = document.createElement("div");
    boxErro.style.color = "#721c24";
    boxErro.style.backgroundColor = "#f8d7da";
    boxErro.style.borderColor = "#f5c6cb";
    boxErro.style.padding = "10px";
    boxErro.style.borderRadius = "4px";
    boxErro.style.marginBottom = "15px";
    form.prepend(boxErro);
  }
  boxErro.textContent = mensagem;
  boxErro.style.display = "block";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura dos campos de entrada
    const nomeInput = document.getElementById("nome") || document.querySelector('input[type="text"]');
    const telInput = document.getElementById("telefone") || document.getElementById("tel") || document.querySelectorAll("input")[1];
    const senhaInput = document.getElementById("senha") || document.querySelector('input[type="password"]');
    const confirmaSenhaInput = document.getElementById("confirmar-senha") || document.querySelectorAll('input[type="password"]')[1];

    const nome = nomeInput ? nomeInput.value.trim() : "";
    const telefone = telInput ? telInput.value.trim() : "";
    const senha = senhaInput ? senhaInput.value : "";
    const confirmaSenha = confirmaSenhaInput ? confirmaSenhaInput.value : "";

    // Validações locais
    if (!nome) {
      mostrarErro("Por favor, preencha o seu nome.");
      return;
    }

    if (!telefone) {
      mostrarErro("Por favor, preencha o número de telefone.");
      return;
    }

    if (!senha) {
      mostrarErro("Por favor, preencha a senha.");
      return;
    }

    if (senha.length < 6) {
      mostrarErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (confirmaSenha && senha !== confirmaSenha) {
      mostrarErro("As senhas não coincidem.");
      return;
    }

    try {
      if (btnSubmit) btnSubmit.disabled = true;
      
      // Chama a função cadastrar passando nome, telefone e senha
      await cadastrar(nome, telefone, senha);

      // Redireciona para a página principal após o cadastro com sucesso
      window.location.href = "home.html";
    } catch (error) {
      console.error("Detalhes do erro no cadastro:", error);
      
      // Exibe a mensagem de erro específica vinda do auth.js em vez do texto genérico
      mostrarErro(error.message || "Erro ao realizar o cadastro. Verifique os dados e tente novamente.");
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}
