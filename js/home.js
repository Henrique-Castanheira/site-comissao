/**
 * Página inicial (home.html): guarda de sessão + exibição do telefone da conta.
 *
 * Só aparece depois que o Firebase confirma uma sessão válida; sem sessão,
 * volta para o login. Essa checagem é conveniência de navegação — a proteção
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
  let telefone = null;
  try {
    const snap = await getDoc(doc(db, "users", usuario.uid));
    if (snap.exists()) telefone = snap.data().phoneNumber;
  } catch (_) { /* segue para o plano B */ }
  if (!telefone) telefone = emailParaTelefone(usuario.email);

  // textContent: nunca interpreta HTML.
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
