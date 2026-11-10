// Dados fixos da aplicação.

// Tipos de item aceitos (usados nos formulários, nos filtros e no relatório).
const TIPOS_ITEM = [
  'Celulares e tablets',
  'Carregadores e cabos',
  'Fones de ouvido',
  'Pilhas e baterias',
  'Pen drives e cartões de memória',
  'Notebooks e acessórios',
  'Outros pequenos eletrônicos'
];

// Pontos de EXEMPLO, só para a tela não começar vazia.
// Não são locais reais: o administrador deve excluí-los e cadastrar os pontos verdadeiros.
const PONTOS_EXEMPLO = [
  {
    id: 'exemplo-1',
    nome: 'Ponto de exemplo 1',
    cidade: 'Cidade Exemplo',
    endereco: 'Rua Exemplo, 100 - Centro',
    horario: 'Seg a sex, 8h às 17h',
    tipos: ['Celulares e tablets', 'Carregadores e cabos', 'Fones de ouvido'],
    exemplo: true
  },
  {
    id: 'exemplo-2',
    nome: 'Ponto de exemplo 2',
    cidade: 'Cidade Exemplo',
    endereco: 'Avenida Exemplo, 200 - Bairro Modelo',
    horario: 'Seg a sáb, 9h às 18h',
    tipos: ['Pilhas e baterias', 'Pen drives e cartões de memória', 'Outros pequenos eletrônicos'],
    exemplo: true
  },
  {
    id: 'exemplo-3',
    nome: 'Ponto de exemplo 3',
    cidade: 'Outra Cidade Exemplo',
    endereco: 'Praça Exemplo, 300',
    horario: 'Seg a sex, 10h às 16h',
    tipos: ['Celulares e tablets', 'Notebooks e acessórios', 'Pilhas e baterias'],
    exemplo: true
  }
];
