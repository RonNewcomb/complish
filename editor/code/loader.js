const alreadyLoadingTheFirstInstance = {};
export const loadHtmls = (element) => Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));
export const loadHtml = async (element) => {
    let tag = element.tagName.toLowerCase();
    if (alreadyLoadingTheFirstInstance[tag]) {
        await alreadyLoadingTheFirstInstance[tag];
        return loadInstance(element, tag);
    }
    alreadyLoadingTheFirstInstance[tag] = loadInstance(element, tag);
    return alreadyLoadingTheFirstInstance[tag];
};
const loadInstance = async (element, tag) => {
    let path = tag.replace(/--/g, "/");
    let template = document.head.querySelector(tag);
    let module = null;
    if (!template) {
        const html = await fetch(`html/${path}.html`).catch(console.error).then(r => r && r.ok ? r.text() : "<template><slot></slot></template>");
        template = new DOMParser().parseFromString(html, 'text/html').head.querySelector('template') || new HTMLTemplateElement();
        template.id = tag;
        document.head.appendChild(template);
    }
    module = customElements.get(tag);
    if (!module) {
        module = await import(`../html/${path}.js`).catch(console.error);
        if (!module || !module.default)
            module = { default: class extends HTMLElement {
                } };
        customElements.define(tag, module.default);
    }
    if (module && template)
        element.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    return loadHtmls(element);
};
export var LoadingHTML = loadHtmls(document.body);
