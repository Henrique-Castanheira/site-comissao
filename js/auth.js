/**
 * Camada de autenticação.
 *
 * Arquitetura: o telefone (E.164) é convertido em um e-mail sintético e usado
 * com o provedor oficial "E-mail/senha" do Firebase Authentication. O Firebase
 * cuida do hash da senha, da emissão/renovação de tokens, da sessão e da
 * limitação de tentativas. Nenhuma senha é guardada por este código.
 * Detalhes e limitações: README.md.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { telefoneParaEmail } from "./phone.js";

/** Entra com telefone (já normalizado em E.164) e senha. */
export async function entrar(telefoneE164, senha) {
  const credencial = await signInWithEmailAndPassword(
    auth,
    telefoneParaEmail(telefoneE164),
    senha
  );
  return credencial.user;
}

/**
 * Cria a conta e o documento complementar em users/{uid}.
 * Se a gravação do perfil falhar, a conta recém-criada é removida para não
 * deixar um usuário sem perfil.
 */
export async function cadastrar(telefoneE164, senha) {
  const credencial = await createUserWithEmailAndPassword(
    auth,
    telefoneParaEmail(telefoneE164),
    senha
  );
  const usuario = credencial.user;

  try {
    await setDoc(doc(db, "users", usuario.uid), {
      uid: usuario.uid,
      phoneNumber: telefoneE164,
      createdAt: serverTimestamp(),
      // Sem consentimento por padrão: cadastrar o telefone NÃO autoriza
      // mensagens de WhatsApp. Ver README.md, seção "Preparação para o WhatsApp".
      whatsappEnabled: false
    });
  } catch (erro) {
    try { await usuario.delete(); } catch (_) { /* melhor esforço */ }
    throw erro;
  }
  return usuario;
}

/** Encerra a sessão. Pode ser chamada no futuro por um botão de sair. */
export function sair() {
  return signOut(auth);
}

/**
 * Observa a sessão. O Firebase restaura e valida a sessão persistida;
 * o callback recebe o usuário ou null.
 */
export function observarSessao(callback) {
  return onAuthStateChanged(auth, callback);
}

/** Traduz códigos de erro do Firebase em mensagens seguras para o usuário. */
export function mensagemDeErro(erro, contexto) {
  const codigo = erro && erro.code;

  if (contexto === "login") {
    // Mensagem genérica de propósito: não revela se o telefone existe.
    if (codigo === "auth/too-many-requests") {
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    if (codigo === "auth/network-request-failed") {
      return "Falha de conexão. Verifique sua internet e tente novamente.";
    }
    return "Telefone ou senha incorretos.";
  }

  switch (codigo) {
    case "auth/email-already-in-use":
      return "Não foi possível criar a conta com estes dados. Se já tiver cadastro, entre com sua senha.";
    case "auth/weak-password":
      return "A senha é fraca. Use pelo menos 8 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet e tente novamente.";
    case "permission-denied":
      return "Não foi possível concluir o cadastro. Tente novamente.";
    default:
      return "Não foi possível criar a conta. Tente novamente em instantes.";
  }
}
