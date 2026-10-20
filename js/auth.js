import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { normalizarTelefone, telefoneParaEmail } from "./phone.js";

/**
 * Traduz e detalha os códigos de erro do Firebase Authentication.
 */
function tratarErroAuth(error, contexto = "autenticação") {
  const code = error?.code || "";
  const originalMessage = error?.message || "";

  let mensagemAcao = "";

  switch (code) {
    case "auth/missing-password":
      mensagemAcao = "A senha não foi fornecida. Certifique-se de preencher o campo de senha.";
      break;
    case "auth/weak-password":
      mensagemAcao = "A senha é muito fraca. Escolha uma senha com pelo menos 6 caracteres.";
      break;
    case "auth/email-already-in-use":
      mensagemAcao = "Este número de telefone já está cadastrado em outra conta. Faça login ou use outro número.";
      break;
    case "auth/invalid-email":
      mensagemAcao = "O formato de telefone/e-mail gerado é inválido. Verifique o número digitado.";
      break;
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      mensagemAcao = "Telefone ou senha incorretos, ou a conta não existe.";
      break;
    case "auth/operation-not-allowed":
      mensagemAcao = "O método E-mail/Senha está desativado no Firebase Authentication. Ative-o no Firebase Console > Authentication > Sign-in method.";
      break;
    case "auth/too-many-requests":
      mensagemAcao = "Muitas tentativas malsucedidas seguidas. Aguarde alguns minutos e tente novamente.";
      break;
    case "auth/network-request-failed":
      mensagemAcao = "Falha de conexão com a rede. Verifique sua conexão com a internet.";
      break;
    case "permission-denied":
      mensagemAcao = "Permissão negada no Firestore. Verifique se o arquivo 'firestore.rules' permite escrita na coleção 'users'.";
      break;
    default:
      mensagemAcao = `Ocorreu uma falha no processo de ${contexto}. (${originalMessage})`;
      break;
  }

  const erroTratado = new Error(`[${code || "erro-desconhecido"}] ${mensagemAcao}`);
  erroTratado.code = code;
  return erroTratado;
}

/**
 * Realiza o login com telefone e senha.
 */
export async function entrar(telefone, senha) {
  // 1. Validação básica do telefone
  if (!telefone || !telefone.trim()) {
    throw new Error("[auth/missing-phone] O número de telefone não foi informado.");
  }

  // 2. Validação básica da senha
  if (!senha) {
    throw new Error("[auth/missing-password] A senha não foi informada.");
  }

  const telNormalizado = normalizarTelefone(telefone);
  if (!telNormalizado) {
    throw new Error("[auth/invalid-phone] Telefone inválido. Insira um número válido com DDD (ex: 11999999999).");
  }

  const emailFicticio = telefoneParaEmail(telNormalizado);

  try {
    const userCredential = await signInWithEmailAndPassword(auth, emailFicticio, senha);
    return userCredential.user;
  } catch (error) {
    throw tratarErroAuth(error, "login");
  }
}

/**
 * Cadastra um novo usuário no Firebase Auth e cria o documento em users/{uid} no Firestore.
 */
export async function cadastrar(nome, telefone, senha) {
  // 1. Validações preliminares antes de chamar o Firebase
  if (!nome || !nome.trim()) {
    throw new Error("[auth/missing-name] O nome do usuário não foi informado.");
  }

  if (!telefone || !telefone.trim()) {
    throw new Error("[auth/missing-phone] O número de telefone não foi informado.");
  }

  if (!senha) {
    throw new Error("[auth/missing-password] A senha não foi informada para o cadastro.");
  }

  const telNormalizado = normalizarTelefone(telefone);
  if (!telNormalizado) {
    throw new Error("[auth/invalid-phone] Telefone em formato inválido. Insira DDD + número celular.");
  }

  const emailFicticio = telefoneParaEmail(telNormalizado);

  // 2. Tentativa de criação no Firebase Auth
  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(auth, emailFicticio, senha);
  } catch (error) {
    throw tratarErroAuth(error, "cadastro no Authentication");
  }

  const user = userCredential.user;

  // 3. Atualização do Perfil (displayName)
  try {
    await updateProfile(user, { displayName: nome });
  } catch (error) {
    console.warn("Aviso: Conta criada, mas não foi possível atualizar o displayName:", error);
  }

  // 4. Salvar os dados do usuário no Firestore (users/{uid})
  try {
    await setDoc(doc(db, "users", user.uid), {
      displayName: nome,
      phoneNumber: telNormalizado,
      email: emailFicticio,
      createdAt: new Date()
    });
  } catch (error) {
    throw tratarErroAuth(error, "gravação do perfil no Firestore");
  }

  return user;
}
