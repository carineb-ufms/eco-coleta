// Componentes reutilizáveis do Vue.
// Cada componente é registrado em app.js com app.component(...).

const PontoCard = {
  name: 'PontoCard',
  props: {
    ponto: { type: Object, required: true }
  },
  // O <slot> permite que cada tela coloque seus próprios botões (ex.: Editar/Excluir na administração).
  template: `
    <article class="cartao">
      <h3 class="cartao__titulo">{{ ponto.nome }}</h3>
      <p class="cartao__selo" v-if="ponto.exemplo">Dado de exemplo</p>
      <p class="cartao__cidade">{{ ponto.cidade }}</p>
      <dl class="cartao__dados">
        <div><dt>Endereço</dt><dd>{{ ponto.endereco }}</dd></div>
        <div><dt>Horário</dt><dd>{{ ponto.horario }}</dd></div>
      </dl>
      <p class="cartao__rotulo">Aceita:</p>
      <ul class="etiquetas">
        <li v-for="t in ponto.tipos" :key="t">{{ t }}</li>
      </ul>
      <div class="cartao__acoes"><slot></slot></div>
    </article>
  `
};

const BarraRelatorio = {
  name: 'BarraRelatorio',
  props: {
    rotulo: { type: String, required: true },
    valor: { type: Number, required: true },
    maximo: { type: Number, required: true }
  },
  computed: {
    largura() {
      // Se não há nenhum item registrado, a barra fica vazia.
      return this.maximo > 0 ? Math.round((this.valor / this.maximo) * 100) : 0;
    }
  },
  template: `
    <div class="barra">
      <span class="barra__rotulo">{{ rotulo }}</span>
      <span class="barra__trilho" aria-hidden="true"><span class="barra__preenchimento" :style="{ width: largura + '%' }"></span></span>
      <span class="barra__valor">{{ valor }}</span>
    </div>
  `
};
