
customElements.define('flex-row', class extends HTMLElement {
  connectedCallback() {
    const flexWrap = typeof this.getAttribute('wrap') === 'string' ? 'flex-wrap: wrap;' : typeof this.getAttribute('nowrap') === 'string' ? 'flex-wrap: nowrap' : '';
    this.attachShadow({ mode: 'open' }).innerHTML = template(flexWrap);
  }
})

function template(flexWrap: string) {
  return /*html*/`<slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start; ${flexWrap}"></slot>`;
}
