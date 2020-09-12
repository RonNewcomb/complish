
class FlexRow extends HTMLElement {
  #wrap = '';
  get wrap() { return this.#wrap; }
  set wrap(v) { this.#wrap = v; FlexRow.render(this); };

  connectedCallback() {
    this.wrap = typeof this.getAttribute('wrap') === 'string' ? 'wrap' : typeof this.getAttribute('nowrap') === 'string' ? 'nowrap' : '';
    this.attachShadow({ mode: 'open' }).innerHTML = template(this.wrap);
  }

  static render({ shadowRoot, wrap }: FlexRow) { if (shadowRoot) shadowRoot.innerHTML = template(wrap); }
}

function template(flexWrap: string) {
  return /*html*/`<slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start; ${flexWrap ? `flex-wrap: ${flexWrap};` : ''}"></slot>`;
}

customElements.define('flex-row', FlexRow);
