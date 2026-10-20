/** Lógica da tela de login (index.html). */
import { entrar, observarSessao, mensagemDeErro } from "./auth.js";
import { normalizarTelefone } from "./phone.js";
import {
  mostrarMensagem,
  limparMensagem,
  erroDeCampo,
  limparErrosDeCampo,
  definirCarregando
} from "./ui.js";

const form = document.getElementById("form-login");
const botao = document.getElementById("btn-entrar");
let enviando = false;

// Bloqueio de conveniência (a proteção real contra força bruta é do Firebase):
// após 5 falhas seguidas, espera 30 s antes de permitir nova tentativa.
const MAX_FALHAS = 5;
const ESPERA_MS = 30000;
let falhas = 0;
let bloqueadoAte = 0;

// Se já existe sessão válida, vai direto para a home.
const parar = observarSessao((usuario) => {
  if (usuario && !enviando) {
    parar();
    window.location.replace("home.html");
  }
});

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  if (enviando) return;

  limparMensagem();
  limparErrosDeCampo(["telefone", "senha"]);

  const agora = Date.now();
  if (agora < bloqueadoAte) {
    const segundos = Math.ceil((bloqueadoAte - agora) / 1000);
    mostrarMensagem("erro", `Aguarde ${segundos} s para tentar novamente.`);
    return;
  }

  const telefoneBruto = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;

  let valido = true;
  if (!telefoneBruto.trim()) {
    erroDeCampo("telefone", "Informe o telefone.");
    valido = false;
  }
  if (!senha) {
    erroDeCampo("senha", "Informe a senha.");
    valido = false;
  }
  if (!valido) return;

  const telefone = normalizarTelefone(telefoneBruto);
  if (!telefone) {
    erroDeCampo("telefone", "Telefone inválido. Use DDD + número ou +código do país.");
    return;
  }

  enviando = true;
  definirCarregando(botao, true);
  try {
    await entrar(telefone, senha);
    window.location.replace("home.html");
  } catch (erro) {
    falhas += 1;
    if (falhas >= MAX_FALHAS) {
      bloqueadoAte = Date.now() + ESPERA_MS;
      falhas = 0;
    }
    mostrarMensagem("erro", mensagemDeErro(erro, "login"));
    enviando = false;
    definirCarregando(botao, false);
  }
});
