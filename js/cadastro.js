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
const form = document.getElementById("form-cadastro");
const botao = document.getElementById("btn-cadastrar");
let enviando = false;

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (enviando) return;

  limparMensagem();
  limparErrosDeCampo(["telefone", "senha", "confirmacao"]);

  const telefoneBruto = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;
  const confirmacao = document.getElementById("confirmacao").value;

  let valido = true;
  let telefone = null;

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
    // O Firebase deixa o usuário autenticado após criar a conta.
    await cadastrar(telefone, senha);
    window.location.replace("home.html");
  } catch (erro) {
    mostrarMensagem("erro", mensagemDeErro(erro, "cadastro"));
    enviando = false;
    definirCarregando(botao, false);
  }
});
