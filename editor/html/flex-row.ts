class FlexRow extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' }).appendChild(createdTemplateNode!.content.cloneNode(true));
    updateTemplateNode(this);
  }

  get wrap() { return this.getAttribute('wrap'); }
  set wrap(v) { this.setAttribute('wrap', v || ''); this.removeAttribute('nowrap'); updateTemplateNode(this); };

  static observedAttributes = ['wrap', 'nowrap'];

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue) updateTemplateNode(this);
  }
}

const txt = /*html*/`
  <template>
    <slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start;"></slot>
  </template>
`;

const createdTemplateNode = new DOMParser().parseFromString(txt, 'text/html').head.querySelector('template');

const updateTemplateNode = ({ shadowRoot, wrap }: FlexRow) => {
  const node = shadowRoot?.firstElementChild as HTMLTemplateElement;
  if (!node) return;
  if (wrap) node.style.setProperty('flex-wrap', wrap);
  else node.style.removeProperty('flex-wrap');
}

customElements.define('flex-row', FlexRow);
