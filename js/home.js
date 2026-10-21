import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const saudacaoEl = document.getElementById("saudacao");
  const nomeEl = document.getElementById("nome-usuario");
  const telEl = document.getElementById("numero-usuario");
  const dataEl = document.getElementById("data-cadastro");
  const btnSair = document.getElementById("btn-sair");

  // Escuta o estado da autenticação
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Se não estiver logado, redireciona para a tela de login
      window.location.href = "index.html";
      return;
    }

    try {
      // 1. Tenta buscar os dados cadastrados no Firestore (users/{uid})
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      let nome = user.displayName || "Usuário";
      let telefone = user.phoneNumber || "Não informado";
      let dataFormatada = "N/A";

      if (docSnap.exists()) {
        const dados = docSnap.data();
        if (dados.displayName) nome = dados.displayName;
        if (dados.phoneNumber) telefone = dados.phoneNumber;
        
        if (dados.createdAt) {
          const dataObj = dados.createdAt.toDate ? dados.createdAt.toDate() : new Date(dados.createdAt);
          dataFormatada = dataObj.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });
        }
      }

      // 2. Preenche a interface com as informações do usuário
      if (saudacaoEl) saudacaoEl.textContent = `Olá, ${nome.split(" ")[0]}!`;
      if (nomeEl) nomeEl.textContent = nome;
      if (telEl) telEl.textContent = telefone;
      if (dataEl) dataEl.textContent = dataFormatada;

      // Revela o corpo do documento após validar a autenticação
      document.body.classList.add("autenticado");

    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      // Mesmo se houver falha na leitura do Firestore, exibe a tela com os dados básicos do Auth
      if (saudacaoEl) saudacaoEl.textContent = "Olá!";
      if (telEl) telEl.textContent = user.email ? user.email.split("@")[0] : "Usuário";
      document.body.classList.add("autenticado");
    }
  });

  // Evento para deslogar da conta
  if (btnSair) {
    btnSair.addEventListener("click", async () => {
      try {
        btnSair.disabled = true;
        btnSair.textContent = "Saindo...";
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Erro ao encerrar sessão:", error);
        alert("Falha ao sair. Tente novamente.");
        btnSair.disabled = false;
        btnSair.textContent = "Sair da Conta";
      }
    });
  }
});
