// Funções de apoio: salvar/ler dados no navegador (localStorage), gerar ids e calcular o hash da senha.
// No MVP não existe servidor, então tudo fica guardado no próprio navegador.

const Armazenamento = {
  ler(chave, padrao) {
    try {
      const texto = localStorage.getItem('ecocoleta:' + chave);
      return texto ? JSON.parse(texto) : padrao;
    } catch (erro) {
      return padrao; // storage bloqueado ou JSON inválido: usa o valor padrão
    }
  },
  gravar(chave, valor) {
    try {
      localStorage.setItem('ecocoleta:' + chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      return false;
    }
  },
  remover(chave) {
    try {
      localStorage.removeItem('ecocoleta:' + chave);
    } catch (erro) { /* sem ação */ }
  }
};

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Senha nunca é guardada em texto puro: guardamos o SHA-256 de (sal + senha).
async function gerarHash(texto) {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumo))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
