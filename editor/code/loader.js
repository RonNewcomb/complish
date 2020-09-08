"use strict";
const attach = (element, comp) => {
    console.log("Componanet", element.tagName, "template", comp.template.content);
    const shadow = element.attachShadow({ mode: 'open' });
    shadow.appendChild(comp.style.cloneNode(true));
    shadow.appendChild(document.importNode(comp.template.content, true));
    Object.entries(comp.listeners).forEach(([event, listener]) => element.addEventListener(event, listener, false));
};
const loadHtmls = (element) => Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));
const loadHtml = (element) => fetch("html/" + element.tagName.replace(/--/g, "/") + ".html")
    .then(response => response.text())
    .then(html => new DOMParser().parseFromString(html, 'text/html').head)
    .then(head => ({
    template: head.querySelector('template'),
    style: head.querySelector('style'),
    script: head.querySelector('script')
}))
    .then(comp => import(URL.createObjectURL(new Blob([comp.script.textContent || ""], { type: 'application/javascript' })))
    .catch(console.error)
    .then(module => ({
    template: comp.template,
    style: comp.style,
    listeners: Object.entries(module.default).reduce((listeners, [setting, value]) => {
        if (setting.startsWith('on'))
            listeners[setting[2].toLowerCase() + setting.substr(3)] = value;
        return listeners;
    }, {}),
})))
    .then(comp => customElements.define(element.tagName.toLowerCase(), class extends HTMLElement {
    connectedCallback() {
        attach(this, comp);
    }
}));
loadHtmls(document.body);
