
export default class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = template;
  }
}
const template = /*html*/`<slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start; flex-wrap: {{wrap}}"></slot>`;
