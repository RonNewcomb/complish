"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _wrap, _a;
customElements.define('flex-row', (_a = class FlexRow extends HTMLElement {
        constructor() {
            super(...arguments);
            _wrap.set(this, '');
        }
        get wrap() { return __classPrivateFieldGet(this, _wrap); }
        set wrap(v) { __classPrivateFieldSet(this, _wrap, v); FlexRow.render(this); }
        ;
        connectedCallback() {
            this.wrap = typeof this.getAttribute('wrap') === 'string' ? 'wrap' : typeof this.getAttribute('nowrap') === 'string' ? 'nowrap' : '';
            this.attachShadow({ mode: 'open' }).innerHTML = template(this.wrap);
        }
        static render({ shadowRoot, wrap }) { if (shadowRoot)
            shadowRoot.innerHTML = template(wrap); }
    },
    _wrap = new WeakMap(),
    _a));
function template(flexWrap) {
    return `<slot style="display: flex; flex-direction: row; flex: 1 1 auto; align-items: flex-start; ${flexWrap ? `flex-wrap: ${flexWrap};` : ''}"></slot>`;
}
