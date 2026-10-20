/**
 * Página inicial (home.html): guarda de sessão + informações básicas do usuário.
 *
 * Só aparece depois que o Firebase confirma uma sessão válida; sem sessão,
 * volta para o login. Essa checagem é conveniência de navegação: a proteção
 * real dos dados está em firestore.rules e no backend.
 */
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { observarSessao, sair } from "./auth.js";
import { db } from "./firebase-init.js";
import { emailParaTelefone, formatarTelefone } from "./phone.js";

observarSessao(async (usuario) => {
  if (!usuario) {
    window.location.replace("index.html");
    return;
  }

  // Fonte principal: users/{uid}. Se a leitura falhar ou o documento não
  // existir, usa o telefone embutido no e-mail sintético da conta.
  let nome = null;
  let telefone = null;
  try {
    const snap = await getDoc(doc(db, "users", usuario.uid));
    if (snap.exists()) {
      nome = snap.data().name || null;
      telefone = snap.data().phoneNumber || null;
    }
  } catch (_) { /* segue para o plano B */ }
  if (!telefone) telefone = emailParaTelefone(usuario.email);

  // textContent: nunca interpreta HTML.
  const primeiroNome = nome ? nome.split(" ")[0] : "";
  document.getElementById("saudacao").textContent = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  document.getElementById("numero-usuario").textContent = formatarTelefone(telefone || "");
  document.body.classList.add("autenticado");
});

/**
 * Logout para uso futuro, sem botão visível nesta versão.
 * Um futuro botão só precisa disparar: document.dispatchEvent(new Event("app:sair"))
 */
document.addEventListener("app:sair", async () => {
  try {
    await sair();
  } finally {
    window.location.replace("index.html");
  }
});
/**
 * Logout. O botão "Sair" dispara o evento "app:sair", que também pode ser
 * disparado por qualquer outro elemento no futuro:
 * document.dispatchEvent(new Event("app:sair"))
 */
const botaoSair = document.getElementById("btn-sair");

document.addEventListener("app:sair", async () => {
  botaoSair.disabled = true; // evita cliques repetidos
  try {
    await sair();
  } finally {
    window.location.replace("index.html");
  }
});

botaoSair.addEventListener("click", () => {
  document.dispatchEvent(new Event("app:sair"));
});
