/**
 * Guarda de sessão da página inicial (home.html).
 *
 * A página é visualmente vazia: não renderiza nada. Aqui só se confirma que
 * existe uma sessão válida do Firebase; caso contrário, volta para o login.
 * Esta verificação é conveniência de navegação — a proteção dos dados é feita
 * pelas regras do Firestore (firestore.rules) e pelo backend.
 */
import { observarSessao, sair } from "./auth.js";

observarSessao((usuario) => {
  if (!usuario) {
    window.location.replace("index.html");
    return;
  }
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
