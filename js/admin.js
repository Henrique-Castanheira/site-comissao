import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const secaoLogin = document.getElementById("secao-login");
  const secaoAdmin = document.getElementById("secao-admin");
  const formLoginAdmin = document.getElementById("form-login-admin");
  const msgLogin = document.getElementById("mensagem-login");
  const msgAdmin = document.getElementById("mensagem-admin");
  const tabelaUsuarios = document.getElementById("tabela-usuarios");
  const btnSairAdmin = document.getElementById("btn-sair-admin");

  // Credenciais estáticas do administrador
  const ADMIN_USER = "henrique";
  const ADMIN_PASS = "he190911";

  // Exibir avisos
  function mostrarMensagem(el, texto, tipo = "erro") {
    el.textContent = texto;
    el.className = `alerta ${tipo}`;
    el.hidden = false;
  }

  // Validação do Login Admin
  formLoginAdmin.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("admin-user").value.trim();
    const pass = document.getElementById("admin-pass").value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      sessionStorage.setItem("admin_autenticado", "true");
      iniciarPainelAdmin();
    } else {
      mostrarMensagem(msgLogin, "Usuário ou senha de administrador incorretos.");
    }
  });

  // Logout Admin
  btnSairAdmin.addEventListener("click", () => {
    sessionStorage.removeItem("admin_autenticado");
    secaoAdmin.hidden = true;
    secaoLogin.hidden = false;
  });

  // Checa se já está logado na sessão
  if (sessionStorage.getItem("admin_autenticado") === "true") {
    iniciarPainelAdmin();
  }

  // Carrega e exibe a lista de usuários do Firestore
  async function iniciarPainelAdmin() {
    secaoLogin.hidden = true;
    secaoAdmin.hidden = false;
    await carregarUsuarios();
  }

  async function carregarUsuarios() {
    tabelaUsuarios.innerHTML = `<tr><td colspan="4" style="text-align: center;">Carregando usuários...</td></tr>`;
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      
      if (querySnapshot.empty) {
        tabelaUsuarios.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum usuário cadastrado.</td></tr>`;
        return;
      }

      tabelaUsuarios.innerHTML = "";
      querySnapshot.forEach((docSnap) => {
        const u = docSnap.data();
        const uid = docSnap.id;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <input type="text" class="edit-input" id="nome-${uid}" value="${u.displayName || ""}">
          </td>
          <td>
            <input type="text" class="edit-input" id="tel-${uid}" value="${u.phoneNumber || ""}">
          </td>
          <td>
            <input type="password" class="edit-input" id="senha-${uid}" placeholder="Digite nova senha">
          </td>
          <td class="acoes-td">
            <button class="btn-acao btn-salvar" data-id="${uid}">Salvar</button>
            <button class="btn-acao btn-deletar" data-id="${uid}">Excluir</button>
          </td>
        `;
        tabelaUsuarios.appendChild(tr);
      });

      // Adiciona eventos aos botões da tabela
      document.querySelectorAll(".btn-salvar").forEach(btn => {
        btn.addEventListener("click", () => salvarAlteracoes(btn.dataset.id));
      });

      document.querySelectorAll(".btn-deletar").forEach(btn => {
        btn.addEventListener("click", () => deletarUsuario(btn.dataset.id));
      });

    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      mostrarMensagem(msgAdmin, "Erro ao carregar lista de usuários. Verifique as regras do Firestore.");
    }
  }

  // Atualizar Nome / Telefone / Senha do usuário no Firestore
  async function salvarAlteracoes(uid) {
    const novoNome = document.getElementById(`nome-${uid}`).value.trim();
    const novoTel = document.getElementById(`tel-${uid}`).value.trim();
    const novaSenha = document.getElementById(`senha-${uid}`).value;

    try {
      const userRef = doc(db, "users", uid);
      const dadosAtualizados = {
        displayName: novoNome,
        phoneNumber: novoTel
      };

      // Se informou nova senha, atualiza o campo de senha no documento
      if (novaSenha) {
        dadosAtualizados.senhaManual = novaSenha;
      }

      await updateDoc(userRef, dadosAtualizados);
      mostrarMensagem(msgAdmin, "Dados do usuário atualizados com sucesso!", "sucesso");
      document.getElementById(`senha-${uid}`).value = "";
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      mostrarMensagem(msgAdmin, "Falha ao atualizar o usuário.");
    }
  }

  // Deletar o documento do usuário do Firestore
  async function deletarUsuario(uid) {
    if (!confirm("Tem certeza que deseja apagar este usuário?")) return;

    try {
      await deleteDoc(doc(db, "users", uid));
      mostrarMensagem(msgAdmin, "Usuário excluído do Firestore com sucesso!", "sucesso");
      await carregarUsuarios();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      mostrarMensagem(msgAdmin, "Falha ao excluir o usuário.");
    }
  }
});
