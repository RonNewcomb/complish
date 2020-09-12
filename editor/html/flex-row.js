"use strict";
const txt = `
  <template>
    <slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start;"></slot>
  </template>
`;
const createdTemplateNode = new DOMParser().parseFromString(txt, 'text/html').head.querySelector('template');
const updateTemplateNode = ({ shadowRoot, wrap }) => {
    const node = shadowRoot?.firstElementChild;
    if (!node)
        return;
    if (wrap)
        node.style.setProperty('flex-wrap', wrap);
    else
        node.style.removeProperty('flex-wrap');
};
class FlexRow extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' }).appendChild(createdTemplateNode.content.cloneNode(true));
        updateTemplateNode(this);
    }
    get wrap() { return this.getAttribute('wrap'); }
    set wrap(v) { this.setAttribute('wrap', v || ''); this.removeAttribute('nowrap'); updateTemplateNode(this); }
    ;
    static get observedAttributes() { return ['wrap', 'nowrap']; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        updateTemplateNode(this);
    }
}
customElements.define('flex-row', FlexRow);
