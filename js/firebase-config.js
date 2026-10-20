/**
 * Configuração do projeto Firebase.
 *
 * Estes valores identificam o seu projeto e são PÚBLICOS por design (ficam no
 * navegador de qualquer jeito). A segurança vem das regras do Firestore, das
 * configurações do Firebase Authentication e, opcionalmente, do App Check.
 *
 * Onde encontrar: Console do Firebase > Configurações do projeto > Geral >
 * Seus aplicativos > App da Web > "Configuração do SDK".
 *
 * NUNCA coloque aqui chaves de conta de serviço, tokens administrativos ou
 * credenciais do WhatsApp.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyDy5Gic4fykbbiBuZy77cLzVtZRm8NWMK0",
  authDomain: "comissao-terra.firebaseapp.com",
  projectId: "comissao-terra",
  storageBucket: "comissao-terra.firebasestorage.app",
  messagingSenderId: "59220028775",
  appId: "1:59220028775:web:3323db5932961b895193c2"
};

/**
 * Domínio reservado (RFC 2606) usado para montar o e-mail sintético que
 * representa o telefone no Firebase Authentication. Não é um e-mail real e
 * nunca recebe mensagens. Se mudar este valor depois que houver contas
 * criadas, ninguém conseguirá entrar — e as regras do Firestore também
 * precisam ser atualizadas.
 */
export const DOMINIO_EMAIL_SINTETICO = "phone.invalid";

/** País assumido quando o usuário digita o telefone sem o código do país. */
export const CODIGO_PAIS_PADRAO = "55";
