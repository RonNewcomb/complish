export const loadHtmls = (element) => Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));
export const loadHtml = async (element) => {
    let tag = element.tagName.toLowerCase();
    let path = tag.replace(/--/g, "/");
    let template = document.head.querySelector(tag);
    let module = null;
    if (!template) {
        const html = await fetch(`html/${path}.html`).catch(console.error).then(r => r && r.ok ? r.text() : "<template><slot></slot></template>");
        template = new DOMParser().parseFromString(html, 'text/html').head.querySelector('template') || new HTMLTemplateElement();
        template.id = tag;
        document.head.appendChild(template);
    }
    if (!customElements.get(tag)) {
        module = await import(`../html/${path}.js`).catch(console.error);
        if (!module || !module.default)
            module = { default: class extends HTMLElement {
                } };
        customElements.define(tag, module.default);
    }
    if (module && template)
        element.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    loadHtmls(element);
};
export var LoadingHTML = loadHtmls(document.body);
