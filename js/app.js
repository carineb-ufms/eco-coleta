// Aplicação principal (Vue 3, Composition API).
const { createApp, ref, reactive, computed, watch, nextTick, onMounted } = Vue;

// Páginas da aplicação. "login" e "admin" indicam quem pode acessar.
const ROTAS = {
  inicio:    { titulo: 'Início' },
  pontos:    { titulo: 'Pontos de coleta' },
  guia:      { titulo: 'Guia de descarte' },
  entrar:    { titulo: 'Entrar' },
  descartar: { titulo: 'Registrar descarte', login: true },
  historico: { titulo: 'Meu histórico', login: true },
  admin:     { titulo: 'Administração', login: true, admin: true }
};

const app = createApp({
  setup() {
    // ---------- Estado ----------
    const view = ref('inicio');
    const menuAberto = ref(false);
    const conteudo = ref(null);
    const campoNomePonto = ref(null);
    const aviso = reactive({ tipo: '', texto: '' });

    const usuarios = ref(Armazenamento.ler('usuarios', []));
    const pontos = ref(Armazenamento.ler('pontos', PONTOS_EXEMPLO));
    const descartes = ref(Armazenamento.ler('descartes', []));
    const usuarioId = ref(Armazenamento.ler('sessao', null));

    const usuario = computed(() => usuarios.value.find(u => u.id === usuarioId.value) || null);
    const ehAdmin = computed(() => !!usuario.value && usuario.value.perfil === 'admin');

    // Sempre que os dados mudam, salvamos no navegador.
    watch(usuarios, v => Armazenamento.gravar('usuarios', v), { deep: true });
    watch(pontos, v => Armazenamento.gravar('pontos', v), { deep: true });
    watch(descartes, v => Armazenamento.gravar('descartes', v), { deep: true });
    watch(usuarioId, v => (v ? Armazenamento.gravar('sessao', v) : Armazenamento.remover('sessao')));

    // ---------- Avisos ----------
    function avisar(tipo, texto) {
      aviso.tipo = tipo;
      aviso.texto = texto;
    }
    function limparAviso() {
      aviso.tipo = '';
      aviso.texto = '';
    }

    // ---------- Navegação (usa o # da URL, assim o botão "voltar" funciona) ----------
    const itensMenu = computed(() => {
      const itens = [
        { id: 'inicio', texto: 'Início' },
        { id: 'pontos', texto: 'Pontos de coleta' },
        { id: 'guia', texto: 'Guia' }
      ];
      if (usuario.value) {
        itens.push({ id: 'descartar', texto: 'Registrar descarte' });
        itens.push({ id: 'historico', texto: 'Histórico' });
        if (ehAdmin.value) itens.push({ id: 'admin', texto: 'Administração' });
      } else {
        itens.push({ id: 'entrar', texto: 'Entrar' });
      }
      return itens;
    });

    function ir(destino) {
      limparAviso();
      if (location.hash === '#' + destino) {
        atualizarView(); // mesma página: só recarrega a view
      } else {
        location.hash = destino;
      }
    }

    function atualizarView() {
      let destino = location.hash.replace('#', '');
      if (!Object.prototype.hasOwnProperty.call(ROTAS, destino)) destino = 'inicio';
      const rota = ROTAS[destino];

      if (rota.login && !usuario.value) {
        destino = 'entrar';
        avisar('info', 'Entre na sua conta para acessar essa página.');
      } else if (rota.admin && !ehAdmin.value) {
        destino = 'inicio';
        avisar('erro', 'Só administradores podem acessar essa página.');
      }

      view.value = destino;
      menuAberto.value = false;
      document.title = ROTAS[destino].titulo + ' | EcoColeta Universitária';
      // Leva o foco para o título da nova página (ajuda leitores de tela e navegação por teclado).
      nextTick(() => {
        const titulo = document.querySelector('main h1');
        if (titulo) titulo.focus({ preventScroll: false });
      });
    }

    function focarConteudo() {
      if (conteudo.value) conteudo.value.focus();
    }

    // ---------- Cadastro e login (RF01) ----------
    const modoCadastro = ref(false);
    const formAuth = reactive({ nome: '', email: '', senha: '' });

    function alternarModo() {
      modoCadastro.value = !modoCadastro.value;
      limparAviso();
    }

    async function enviarAuth() {
      limparAviso();
      const email = formAuth.email.trim().toLowerCase();
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!emailValido) return avisar('erro', 'Informe um e-mail válido, como nome@exemplo.com.');
      if (formAuth.senha.length < 6) return avisar('erro', 'A senha precisa ter pelo menos 6 caracteres.');
      if (!(window.crypto && window.crypto.subtle)) {
        return avisar('erro', 'Seu navegador não permite proteger a senha nesta página. Abra o site por https ou por localhost.');
      }

      if (modoCadastro.value) {
        if (!formAuth.nome.trim()) return avisar('erro', 'Informe seu nome completo.');
        if (usuarios.value.some(u => u.email === email)) {
          return avisar('erro', 'Esse e-mail já está cadastrado. Tente entrar na sua conta.');
        }
        const sal = gerarId();
        const novo = {
          id: gerarId(),
          nome: formAuth.nome.trim(),
          email,
          sal,
          senhaHash: await gerarHash(sal + formAuth.senha),
          // O primeiro cadastro vira administrador (assim não existe senha fixa no código).
          perfil: usuarios.value.length === 0 ? 'admin' : 'estudante'
        };
        usuarios.value.push(novo);
        usuarioId.value = novo.id;
        formAuth.nome = formAuth.email = formAuth.senha = '';
        ir('inicio');
        avisar('sucesso', novo.perfil === 'admin'
          ? 'Conta criada. Você é a primeira pessoa cadastrada, então tem acesso à administração.'
          : 'Conta criada. Bem-vinda(o), ' + novo.nome.split(' ')[0] + '!');
      } else {
        const encontrado = usuarios.value.find(u => u.email === email);
        const hash = encontrado ? await gerarHash(encontrado.sal + formAuth.senha) : null;
        if (!encontrado || hash !== encontrado.senhaHash) {
          return avisar('erro', 'E-mail ou senha incorretos. Confira os dados e tente de novo.');
        }
        usuarioId.value = encontrado.id;
        formAuth.email = formAuth.senha = '';
        ir('inicio');
        avisar('sucesso', 'Você entrou na sua conta.');
      }
    }

    function sair() {
      usuarioId.value = null;
      ir('inicio');
      avisar('info', 'Você saiu da conta.');
    }

    // ---------- Pontos de coleta (RF02) ----------
    const filtroCidade = ref('');
    const filtroTipo = ref('');

    const cidades = computed(() =>
      [...new Set(pontos.value.map(p => p.cidade))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
    );
    const pontosFiltrados = computed(() =>
      pontos.value.filter(p =>
        (!filtroCidade.value || p.cidade === filtroCidade.value) &&
        (!filtroTipo.value || p.tipos.includes(filtroTipo.value))
      )
    );

    // ---------- Registrar descarte (RF03) ----------
    const formDescarte = reactive({ tipo: '', quantidade: 1, pontoId: '', obs: '' });
    const ultimoDescarte = ref(null);

    const pontosParaTipo = computed(() =>
      pontos.value.filter(p => !formDescarte.tipo || p.tipos.includes(formDescarte.tipo))
    );
    // Se trocar o tipo e o ponto escolhido não aceitar o novo tipo, limpa o ponto.
    watch(() => formDescarte.tipo, () => {
      if (!pontosParaTipo.value.some(p => p.id === formDescarte.pontoId)) formDescarte.pontoId = '';
    });

    function registrarDescarte() {
      limparAviso();
      const qtd = Number(formDescarte.quantidade);
      const ponto = pontos.value.find(p => p.id === formDescarte.pontoId);

      if (!formDescarte.tipo) return avisar('erro', 'Escolha o tipo de item que você descartou.');
      if (!Number.isInteger(qtd) || qtd < 1 || qtd > 99) return avisar('erro', 'Informe uma quantidade entre 1 e 99.');
      if (!ponto) return avisar('erro', 'Escolha o ponto de coleta onde você entregou o item.');

      const registro = {
        id: gerarId(),
        usuarioId: usuarioId.value,
        tipo: formDescarte.tipo,
        quantidade: qtd,
        pontoId: ponto.id,
        pontoNome: ponto.nome, // guardamos o nome para o histórico não quebrar se o ponto for excluído
        obs: formDescarte.obs.trim(),
        data: new Date().toISOString()
      };
      descartes.value.push(registro);
      ultimoDescarte.value = registro;
      formDescarte.tipo = '';
      formDescarte.quantidade = 1;
      formDescarte.pontoId = '';
      formDescarte.obs = '';
      avisar('sucesso', 'Descarte registrado. Obrigada(o) por descartar do jeito certo!');
    }

    // ---------- Histórico (RF06) ----------
    const meusDescartes = computed(() =>
      descartes.value
        .filter(d => d.usuarioId === usuarioId.value)
        .sort((a, b) => b.data.localeCompare(a.data))
    );
    const totalMeusItens = computed(() => meusDescartes.value.reduce((soma, d) => soma + d.quantidade, 0));
    const totalItensGeral = computed(() => descartes.value.reduce((soma, d) => soma + d.quantidade, 0));

    function formatarData(iso) {
      return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    }
    function codigo(d) {
      return d.id.slice(-6).toUpperCase();
    }

    // ---------- Administração: pontos (RF04) ----------
    const formVazio = () => ({ id: null, nome: '', cidade: '', endereco: '', horario: '', tipos: [] });
    const formPonto = reactive(formVazio());

    function limparFormPonto() {
      Object.assign(formPonto, formVazio());
    }

    function salvarPonto() {
      limparAviso();
      const dados = {
        nome: formPonto.nome.trim(),
        cidade: formPonto.cidade.trim(),
        endereco: formPonto.endereco.trim(),
        horario: formPonto.horario.trim(),
        tipos: [...formPonto.tipos]
      };
      if (!dados.nome || !dados.cidade || !dados.endereco || !dados.horario) {
        return avisar('erro', 'Preencha nome, cidade, endereço e horário do ponto.');
      }
      if (dados.tipos.length === 0) return avisar('erro', 'Marque pelo menos um tipo de item aceito.');

      if (formPonto.id) {
        const indice = pontos.value.findIndex(p => p.id === formPonto.id);
        if (indice >= 0) pontos.value[indice] = { id: formPonto.id, ...dados };
        avisar('sucesso', 'Ponto de coleta atualizado.');
      } else {
        pontos.value.push({ id: gerarId(), ...dados });
        avisar('sucesso', 'Ponto de coleta adicionado.');
      }
      limparFormPonto();
    }

    function editarPonto(ponto) {
      limparAviso();
      Object.assign(formPonto, { ...ponto, tipos: [...ponto.tipos] });
      nextTick(() => {
        if (campoNomePonto.value) {
          campoNomePonto.value.scrollIntoView({ block: 'center' });
          campoNomePonto.value.focus();
        }
      });
    }

    function cancelarEdicao() {
      limparFormPonto();
    }

    function excluirPonto(ponto) {
      if (!window.confirm('Excluir o ponto "' + ponto.nome + '"? Os descartes já registrados continuam no histórico.')) return;
      pontos.value = pontos.value.filter(p => p.id !== ponto.id);
      if (formPonto.id === ponto.id) limparFormPonto();
      avisar('sucesso', 'Ponto de coleta excluído.');
    }

    // ---------- Administração: relatório (RF07) ----------
    const relatorioPorTipo = computed(() =>
      TIPOS_ITEM.map(tipo => ({
        tipo,
        total: descartes.value.filter(d => d.tipo === tipo).reduce((soma, d) => soma + d.quantidade, 0)
      }))
    );
    const maiorTotal = computed(() => Math.max(0, ...relatorioPorTipo.value.map(l => l.total)));

    // ---------- Início ----------
    onMounted(() => {
      window.addEventListener('hashchange', atualizarView);
      atualizarView();
    });

    return {
      // estado e navegação
      view, menuAberto, conteudo, campoNomePonto, aviso, itensMenu, ir, focarConteudo,
      // usuários
      usuarios, usuario, ehAdmin, modoCadastro, formAuth, alternarModo, enviarAuth, sair,
      // pontos
      pontos, tiposItem: TIPOS_ITEM, cidades, filtroCidade, filtroTipo, pontosFiltrados,
      // descartes
      descartes, formDescarte, pontosParaTipo, registrarDescarte, ultimoDescarte,
      meusDescartes, totalMeusItens, totalItensGeral, formatarData, codigo,
      // administração
      formPonto, salvarPonto, editarPonto, cancelarEdicao, excluirPonto, relatorioPorTipo, maiorTotal
    };
  }
});

app.component('ponto-card', PontoCard);
app.component('barra-relatorio', BarraRelatorio);
app.mount('#app');
