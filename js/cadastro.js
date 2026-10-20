/** Lógica da tela de cadastro (cadastro.html). */
import { cadastrar, mensagemDeErro } from "./auth.js";
import { normalizarTelefone } from "./phone.js";
import {
  mostrarMensagem,
  limparMensagem,
  erroDeCampo,
  limparErrosDeCampo,
  definirCarregando
} from "./ui.js";

const TAMANHO_MINIMO_SENHA = 8;
const NOME_MIN = 2;
const NOME_MAX = 80;
const form = document.getElementById("form-cadastro");
const botao = document.getElementById("btn-cadastrar");
let enviando = false;

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (enviando) return;

  limparMensagem();
  limparErrosDeCampo(["nome", "telefone", "senha", "confirmacao"]);

  // Remove espaços nas pontas e reduz espaços repetidos.
  const nome = document.getElementById("nome").value.trim().replace(/\s+/g, " ");
  const telefoneBruto = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;
  const confirmacao = document.getElementById("confirmacao").value;

  let valido = true;
  let telefone = null;

  if (!nome) {
    erroDeCampo("nome", "Informe o nome.");
    valido = false;
  } else if (nome.length < NOME_MIN || nome.length > NOME_MAX || !/\p{L}/u.test(nome)) {
    erroDeCampo("nome", `Informe um nome válido (de ${NOME_MIN} a ${NOME_MAX} caracteres).`);
    valido = false;
  }

  if (!telefoneBruto.trim()) {
    erroDeCampo("telefone", "Informe o telefone.");
    valido = false;
  } else {
    telefone = normalizarTelefone(telefoneBruto);
    if (!telefone) {
      erroDeCampo("telefone", "Telefone inválido. Use DDD + número ou +código do país.");
      valido = false;
    }
  }

  if (!senha) {
    erroDeCampo("senha", "Informe a senha.");
    valido = false;
  } else if (senha.length < TAMANHO_MINIMO_SENHA) {
    erroDeCampo("senha", `A senha deve ter pelo menos ${TAMANHO_MINIMO_SENHA} caracteres.`);
    valido = false;
  }

  if (!confirmacao) {
    erroDeCampo("confirmacao", "Confirme a senha.");
    valido = false;
  } else if (senha !== confirmacao) {
    erroDeCampo("confirmacao", "As senhas não coincidem.");
    valido = false;
  }

  if (!valido) return;

  enviando = true;
  definirCarregando(botao, true);
  try {
    await cadastrar(nome, telefone, senha);
    window.location.href = "home.html"; // ou o fluxo de sucesso do seu projeto
  } catch (error) {
    console.error("Erro no cadastro:", error);
  // Exibe a mensagem explicativa retornada do auth.js
    exibirErro(error.message || "Não foi possível concluir o cadastro. Tente novamente.");
  }
});
