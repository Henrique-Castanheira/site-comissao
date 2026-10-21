# 📡 Site Comissão Terra Fibra

Aplicação web desenvolvida para autenticação de consultores e simulação/cálculo de **Remuneração Variável (RV)** com base nas regras comerciais do projeto Terra Fibra[cite: 6].

---

## 🚀 Funcionalidades

### 🔐 Autenticação e Perfil
* **Login simplificado:** Acesso rápido utilizando número de telefone e senha (com suporte a autenticação automática via parâmetros de URL).
* **Cadastro de novos usuários:** Registro de consultores com gravação de perfil no Firestore (`users/{uid}`).
* **Sessão protegida:** Validação de login em tempo real na página inicial (`home.html`) para evitar acessos não autorizados.

### 🧮 Simulador de Comissões (RV)
* **Cálculo automatizado:** Simulação precisa de comissões para múltiplos canais e cargos[cite: 7]:
  * Consultores PAP e Call Center (Faixas de ganho e Acelerador de Qualidade)[cite: 12, 15]
  * Célula Digital / Online[cite: 19]
  * Líderes de Equipe (PAP, Call Center e Digital)[cite: 13, 16, 21]
  * Executivos de Vendas[cite: 23]
* **Aceleradores de Desempenho:** Aplicação automática de bônus por Índice de Qualidade[cite: 10, 12, 15, 19].

### 🛡️ Gestão Administrativa
* **Painel do Administrador (`admin.html`):** Portal para gerenciamento de contas registradas.
* **Controle de Usuários:** Permite atualizar nomes, telefones, redefinir senhas manuais ou excluir registros cadastrados da base de dados.

---

## 🛠️ Tecnologias Utilizadas

* **HTML5 & CSS3:** Interface responsiva construída com CSS nativo e variáveis globais para estilização fluida.
* **JavaScript ES6+ (Modules):** Estrutura modular sem dependência de frameworks pesados.
* **Firebase v10 (SDK Modular):**
  * **Firebase Authentication:** Gestão de acesso dos usuários.
  * **Cloud Firestore:** Armazenamento do perfil de consultores e controle de permissões.

---

## 📂 Estrutura do Projeto

```text
├── index.html           # Tela de Login de Consultores
├── cadastro.html        # Tela de Cadastro de novos usuários
├── home.html            # Painel do usuário & Simulador de Comissões
├── admin.html           # Painel de Administração de Usuários
├── css/
│   └── style.css        # Estilos globais e paleta de cores
└── js/
    ├── firebase-config.js # Configuração do projeto Firebase (oculta)
    ├── firebase-init.js   # Inicialização dos serviços Firebase Auth e Firestore
    ├── auth.js            # Módulo de Autenticação (Login, Cadastro e Tratamento de Erros)
    ├── phone.js           # Utilitário de normalização de telefone
    ├── comissoes.js       # Módulo contendo as regras e fórmulas de cálculo de RV
    ├── login.js           # Lógica da interface de login
    ├── cadastro.js        # Lógica da interface de cadastro
    ├── home.js            # Lógica do painel principal e calculadora
    └── admin.js           # Lógica do painel de administração
