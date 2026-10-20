# Cadastro e login por telefone + senha (Firebase + GitHub Pages)

Site estático com tela de login, tela de cadastro (nome, telefone e senha) e
uma página inicial que mostra apenas o telefone da conta. Preparado para, no futuro, enviar mensagens por
WhatsApp a partir de um backend confiável.

## Estrutura de arquivos

```
index.html          Tela de login
cadastro.html       Tela de cadastro
home.html           Página inicial (mostra só o telefone), protegida por sessão
css/style.css       Estilos neutros (variáveis em :root)
js/firebase-config.js  Configuração do projeto Firebase (PREENCHER)
js/firebase-init.js    Inicializa App, Auth e Firestore
js/phone.js            Normalização/validação E.164 e e-mail sintético
js/auth.js             Entrar, cadastrar, sair, observar sessão, mensagens de erro
js/ui.js               Mensagens, erros de campo, estado de carregamento
js/login.js            Lógica do login
js/cadastro.js         Lógica do cadastro
js/home.js             Guarda de sessão, exibe o telefone, logout para uso futuro
firestore.rules        Regras de segurança do Firestore
```

## Arquitetura de autenticação escolhida

**Firebase Authentication (e-mail/senha) com telefone como identificador
(Alternativa B, na variante sem backend próprio).**

O Firebase não tem login nativo "telefone + senha". Então o telefone em E.164
(`+5511999999999`) vira um e-mail sintético determinístico
(`5511999999999@phone.invalid`) e é usado no provedor oficial de e-mail/senha.
O domínio `.invalid` é reservado (RFC 2606): nunca é um e-mail real.

Por que esta escolha:

- **Segurança herdada do Firebase:** hash de senha, tokens, renovação de sessão,
  bloqueio de tentativas excessivas (`auth/too-many-requests`).
- **Sem servidor:** funciona direto no GitHub Pages; não precisa do plano Blaze
  nem de Cloud Functions neste momento.
- **Unicidade do telefone:** o Firebase impede dois usuários com o mesmo e-mail
  sintético, logo, dois cadastros com o mesmo telefone.
- **Vínculo com o Firestore:** o documento é `users/{uid}`, e as regras exigem
  que o telefone gravado corresponda ao e-mail sintético do token do próprio
  usuário.

### Sessão

O SDK guarda a sessão (tokens do Firebase) no armazenamento do navegador, no
formato gerenciado por ele. A senha **nunca** é gravada em `localStorage`,
`sessionStorage`, cookies ou Firestore. `home.html` só aparece depois que
`onAuthStateChanged` confirma um usuário; sem sessão válida, redireciona para
`index.html`. Essa checagem é conveniência de navegação: a proteção real dos
dados está em `firestore.rules`.

### Limitações (leia antes de ir para produção)

1. **O telefone não é verificado.** O cadastro valida só o formato. Qualquer
   pessoa pode cadastrar o número de outra. Antes de enviar WhatsApp, é
   necessário confirmar a posse (ver "Preparação para o WhatsApp").
2. **Sem recuperação de senha.** Não há e-mail real, e um reset por SMS exige
   verificação de telefone + backend. Por isso o link "Esqueci minha senha" foi
   omitido, como a especificação permite. Opções futuras: verificar o telefone
   por SMS (Firebase Phone Auth, cobrado por SMS, exige plano Blaze) e, via
   Cloud Function com Admin SDK, redefinir a senha após a verificação.
3. **Enumeração de contas no cadastro:** tentar cadastrar um telefone já
   existente revela que ele existe (o login, ao contrário, usa mensagem
   genérica). É um trade-off comum; mitigue com App Check e limites do Firebase.
4. **Contas órfãs:** se a gravação do perfil falhar, o código apaga a conta
   recém-criada. Em caso de falha de rede nesse instante, pode sobrar uma conta
   sem perfil; o backend futuro pode reconciliar.
5. O bloqueio de 30 s após 5 falhas em `login.js` é só conveniência de UX
   (contornável). A defesa real é a limitação do Firebase.

## Configuração (passo a passo)

1. **Criar o projeto** em https://console.firebase.google.com.
2. **Authentication > Método de login:** ative **E-mail/senha** (não ative o
   link por e-mail). Em **Configurações > Política de senha**, se quiser,
   exija o mínimo de 8 caracteres.
3. **Authentication > Configurações > Domínios autorizados:** adicione
   `SEU-USUARIO.github.io` (e `localhost` para testes).
4. **Firestore Database:** crie o banco em modo de produção, escolha a região
   e cole o conteúdo de `firestore.rules` em **Regras** > Publicar.
5. **App da Web:** em Configurações do projeto, registre um app da Web e copie
   o objeto de configuração para `js/firebase-config.js`.
6. **Restrinja a chave de API** no Google Cloud Console (Credenciais) para os
   referenciadores `https://SEU-USUARIO.github.io/*` e `http://localhost/*`.
   A chave é pública, mas restringi-la reduz abuso.
7. **(Recomendado) App Check** com reCAPTCHA v3/Enterprise para Auth e
   Firestore, reduzindo abuso automatizado.

### Testar localmente

Os módulos ES não funcionam abrindo o arquivo por `file://`. Use um servidor
estático, por exemplo `python3 -m http.server 8000` dentro da pasta e acesse
`http://localhost:8000`.

### Publicar no GitHub Pages

1. Suba o conteúdo desta pasta para um repositório no GitHub.
2. **Settings > Pages > Build and deployment:** Source = "Deploy from a
   branch", branch `main`, pasta `/ (root)`.
3. Acesse `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.
4. Confirme que esse domínio está em Authentication > Domínios autorizados.

Os caminhos usados são relativos, então funcionam em subpasta de repositório.

## Modelo de dados (Firestore)

Coleção `users`, documento = UID do Firebase Auth:

| Campo | Tipo | Observação |
|---|---|---|
| `uid` | string | Igual ao ID do documento |
| `name` | string | Nome informado no cadastro (2 a 80 caracteres) |
| `phoneNumber` | string | E.164 normalizado |
| `createdAt` | timestamp | Data do servidor |
| `whatsappEnabled` | boolean | Começa `false`; o usuário só pode revogar (true → false) |
| `updatedAt` | timestamp | Usado quando há atualização (ex.: revogação) |

Regras resumidas: cada usuário lê só o próprio documento; cria só o próprio,
com os campos exatos, nome válido, telefone coerente com o token e
`whatsappEnabled=false`;
só pode atualizar `whatsappEnabled` para `false`; não apaga; todo o resto é
negado. Operações privilegiadas devem ir para o backend (Admin SDK, que
ignora as regras e por isso precisa fazer as próprias verificações).

## Logout

`js/auth.js` exporta `sair()`. Em `home.html`, qualquer futuro botão pode
disparar `document.dispatchEvent(new Event("app:sair"))` e o logout acontece,
redirecionando para o login. Não há botão visível nesta versão.

## Preparação para o WhatsApp (não implementado)

O que já está pronto:

- Telefones guardados em E.164, adequados como identificador do destinatário.
- `whatsappEnabled` inicia `false`: cadastrar o número **não** concede
  consentimento.
- O usuário pode revogar o consentimento pelas regras; conceder será papel do
  backend.
- O frontend não contém, e nunca deve conter, tokens ou credenciais do WhatsApp.

O que fazer na etapa futura:

1. **Backend separado** (por exemplo, Cloud Functions ou Cloud Run) com o
   Firebase Admin SDK, guardando segredos em Secret Manager/variáveis de
   ambiente, nunca no repositório do site.
2. **Verificar a posse do número** (código por SMS ou, melhor, um código enviado
   pelo próprio WhatsApp) antes de ativar o envio.
3. **Registrar o consentimento** com prova: quando, como e qual texto foi
   aceito (por exemplo, subcoleção `users/{uid}/consents`, escrita só pelo
   backend), com opção de revogação.
4. **Checar antes de cada envio:** `whatsappEnabled == true`, consentimento
   válido e não revogado, e regras de janela/modelo de mensagem.
5. **WhatsApp Business Platform** (API oficial da Meta ou provedor
   compatível): mensagens iniciadas pela empresa exigem modelos aprovados e
   são cobradas conforme as políticas vigentes — confirme preços e regras na
   documentação da Meta antes de contratar.
6. Só então adicionar, se quiser, uma tela de preferências para o usuário
   conceder/revogar o consentimento.

## Personalização

- **Visual:** edite as variáveis em `:root` de `css/style.css`.
- **País padrão:** `CODIGO_PAIS_PADRAO` em `js/firebase-config.js`.
- **Domínio do e-mail sintético:** `DOMINIO_EMAIL_SINTETICO` (mude também a
  expressão regular e o texto em `firestore.rules`, e só antes de criar contas).
