"use strict";
const loadHtmls = (element) => Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));
const loadHtml = (element) => fetch("html/" + element.tagName.replace(/--/g, "/") + ".html")
    .then(response => response.text())
    .then(async (html) => {
    const head = new DOMParser().parseFromString(html, 'text/html').head;
    const comp = {
        template: head.querySelector('template'),
        style: head.querySelector('style'),
        script: head.querySelector('script'),
    };
    if (comp.script && comp.script.textContent) {
        const blob = new Blob([comp.script.textContent], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const module = await import(url).catch(e => console.error(element.tagName, e));
        comp.listeners = Object.entries(module.default).reduce((listeners, [setting, value]) => {
            if (setting.startsWith("on"))
                listeners[setting[2].toLowerCase() + setting.substr(3)] = value;
            return listeners;
        }, {});
    }
    customElements.define(element.tagName.toLowerCase(), class extends HTMLElement {
        connectedCallback() {
            const shadow = this.attachShadow({ mode: 'open' });
            if (comp.style)
                shadow.appendChild(comp.style.cloneNode(true));
            if (comp.template?.content)
                shadow.appendChild(document.importNode(comp.template.content, true));
            if (comp.listeners)
                Object.entries(comp.listeners).forEach(([event, listener]) => this.addEventListener(event, listener, false));
        }
    });
});
loadHtmls(document.body);
