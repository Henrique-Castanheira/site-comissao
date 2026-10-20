
/**
 * Configuração do projeto Firebase.
 * Estes dados identificam a aplicação web.
 * Nunca coloque senhas, tokens administrativos ou credenciais privadas aqui.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDy5G5ic4fykbbiBuZy77cLzVtZRm8NWMK0",
  authDomain: "comissao-terra.firebaseapp.com",
  projectId: "comissao-terra",
  storageBucket: "comissao-terra.firebasestorage.app",
  messagingSenderId: "59220028775",
  appId: "1:59220028775:web:3323db5932961b895193c2"
};

// Inicializa o Firebase uma única vez.
export const app = initializeApp(firebaseConfig);

/**
 * Domínio reservado para representar o telefone como e-mail sintético,
 * caso a estratégia de autenticação do projeto utilize esse método.
 *
 * Não é um endereço de e-mail real.
 */
export const DOMINIO_EMAIL_SINTETICO = "phone.invalid";

/** Código do Brasil, utilizado quando o telefone é informado sem DDI. */
export const CODIGO_PAIS_PADRAO = "55";
