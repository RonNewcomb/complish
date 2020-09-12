
customElements.define('flex-row', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = template();
  }
})

function template() {
  return  /*html*/`<slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start; flex-wrap: {{wrap}}"></slot>`;
}
