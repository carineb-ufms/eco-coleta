# EcoColeta Universitária

Aplicação web dinâmica para ajudar estudantes do ensino superior a descartar lixo eletrônico do jeito certo. O estudante consulta pontos de coleta, vê o que cada ponto aceita, registra o que entregou e acompanha o histórico. O administrador cadastra os pontos e vê um relatório básico.

Projeto Integrador de Tecnologia da Informação II — UFMS Digital (2026.2).
Esta versão é o **MVP** definido na análise de requisitos do Módulo 1.

## Como executar

Não precisa instalar nada. Escolha uma das opções:

1. **Abrir direto:** dê dois cliques no `index.html`.
2. **Servidor local (recomendado):** na pasta do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000`.
3. **GitHub Pages:** em *Settings → Pages*, escolha a branch `main` e a pasta `/ (root)`.

É preciso internet na primeira abertura, porque o Vue é carregado por CDN (jsDelivr).

> A proteção da senha usa `crypto.subtle`, que só funciona em `https://`, `localhost` ou arquivo local. No GitHub Pages (https) funciona normalmente.

## Primeiro uso

1. Vá em **Entrar → Criar conta**.
2. **A primeira conta criada vira administradora**; as seguintes são de estudante.
3. Como administradora, abra **Administração**, exclua os pontos de exemplo e cadastre os pontos reais.

## Requisitos atendidos (MVP)

| Código | Requisito | Onde está |
|---|---|---|
| RF01 | Cadastro e login | página Entrar |
| RF02 | Consultar pontos por cidade e tipo de item | página Pontos de coleta |
| RF03 | Registrar descarte | página Registrar descarte |
| RF04 | Administrador gerencia pontos | página Administração |
| RF05 | Guia de descarte e cuidados | página Guia |
| RF06 | Histórico do estudante | página Histórico |
| RF07 | Relatório básico | página Administração |
| RNF01 | Responsivo | `css/style.css` (mobile first) |
| RNF02 | Registro em poucos passos | formulário único de 4 campos |
| RNF04 | Senha criptografada | SHA-256 com sal (veja limitações) |
| RNF05 | Dados mínimos (LGPD) | só nome, e-mail e senha |
| RNF07 | Código organizado e documentado | este repositório e este README |

Ficaram de fora do MVP (Could/Won't no MoSCoW): comprovante em PDF, lembretes, ranking, app nativo e integrações.

## Estrutura de pastas

```
ecocoleta/
├── index.html          # estrutura semântica da aplicação (template do Vue)
├── css/style.css       # estilos responsivos
└── js/
    ├── dados.js        # tipos de item e pontos de exemplo
    ├── armazenamento.js# localStorage, geração de id e hash de senha
    ├── componentes.js  # componentes reutilizáveis (PontoCard, BarraRelatorio)
    └── app.js          # estado, regras e navegação (Vue 3)
```

## Decisões de desenvolvimento

**Framework: Vue.js 3 via CDN.** O Vue foi o framework visto na disciplina e permite criar a interface dinâmica (filtros, formulários, listas) sem recarregar a página. Usei o build global por CDN, sem Node/Vite, para o projeto abrir sem instalação e ficar simples de publicar. A versão está fixada (3.5.13) para o projeto não quebrar com atualizações.

**Composition API.** Estado com `ref`/`reactive`, valores derivados com `computed` (filtros, relatório, histórico) e `watch` para salvar os dados.

**Componentes.** `PontoCard` é usado nas páginas Pontos e Administração (com `<slot>` para os botões) e `BarraRelatorio` desenha as barras do relatório. Isso evita repetir código.

**Persistência com localStorage.** O MVP não tem servidor, então os dados ficam no navegador de cada pessoa. Serve para validar a ideia, mas os dados não são compartilhados entre dispositivos.

**Navegação por hash (`#pontos`, `#guia`...).** Mantém a aplicação em uma página só e o botão "voltar" do navegador funciona. Páginas que exigem login ou perfil de administrador redirecionam quem não tem permissão.

**Primeiro usuário é administrador.** Assim não existe senha fixa escrita no código-fonte.

**Pontos de exemplo.** Os três pontos iniciais são fictícios e aparecem com o selo "Dado de exemplo". Não coloquei endereços reais para não passar informação errada.

**HTML semântico e acessibilidade.** `header`, `nav`, `main`, `section`, `article`, `footer` e `aside`; `lang="pt-BR"`; todos os campos com `label`; tabela com `th scope`; link "Pular para o conteúdo"; `aria-current` no menu; área `aria-live` para avisos; foco levado ao título a cada troca de página; foco visível no teclado; alvos de toque de pelo menos 44 px; respeito a `prefers-reduced-motion`.

**CSS responsivo.** Mobile first, com variáveis CSS, unidades relativas (`rem`), Flexbox e CSS Grid. Os pontos de quebra (`40rem` e `56rem`) ampliam as colunas e trocam o menu recolhível por um menu em linha.

## Limitações conhecidas

- Sem back-end: a autenticação roda no navegador, então **não é segura para uso real**. O hash com sal protege a senha guardada, mas qualquer pessoa com acesso ao navegador consegue ver ou alterar os dados.
- Os dados não sincronizam entre dispositivos.
- Os testes automatizados (Vitest/Cypress, citados nas videoaulas) não foram criados nesta versão; os testes foram manuais.

## Próximos passos

- Back-end com banco de dados (por exemplo Node.js + banco) e autenticação de verdade.
- Comprovante de descarte, lembretes e ranking (requisitos "Could").
- Testes automatizados e publicação com Vite/Nuxt.

## Tecnologias

HTML5, CSS3, JavaScript e Vue.js 3.
