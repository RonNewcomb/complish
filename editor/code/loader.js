const alreadyLoadingTheFirstInstance = {};
export const loadHtmls = (element) => {
    console.log(element.tagName, "showing children", element.children.length + (element.shadowRoot ? element.shadowRoot.children.length : 0));
    return Promise.all(Array.from(element.children).concat(Array.from(element.shadowRoot?.children || [])).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child).catch(console.error)));
};
export const loadHtml = async (element) => {
    let tag = element.tagName.toLowerCase();
    console.log(tag, 'considering');
    if (alreadyLoadingTheFirstInstance[tag]) {
        console.log(tag, "2nd instance pausing");
        await alreadyLoadingTheFirstInstance[tag];
        console.log(tag, "2nd instance");
        return loadInstance(element, tag);
    }
    alreadyLoadingTheFirstInstance[tag] = loadInstance(element, tag);
    return alreadyLoadingTheFirstInstance[tag];
};
const loadInstance = async (element, tag) => {
    let path = tag.replace(/--/g, "/");
    let template = document.head.querySelector(`template#${tag}`);
    let module = null;
    console.log(1, tag, "has", "module", !!module, "template", !!template);
    if (!template) {
        console.log(1, tag, "didn't have template");
        const html = await fetch(`html/${path}.html`).catch(console.error).then(r => r && r.ok ? r.text() : "<template><slot></slot></template>");
        template = new DOMParser().parseFromString(html, 'text/html').head.querySelector('template') || new HTMLTemplateElement();
        template.id = tag;
        document.head.appendChild(template);
    }
    console.log(2, tag, "has", "module", !!module, "template", !!template);
    module = customElements.get(tag);
    if (!module) {
        console.log(2, tag, "didn't have module");
        module = await import(`../html/${path}.js`).catch(console.error);
        if (!module || !module.default)
            module = { default: class extends HTMLElement {
                } };
        customElements.define(tag, module.default);
    }
    console.log(3, tag, "has", "module", !!module, "template", !!template);
    if (module && template)
        element.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    return loadHtmls(element).catch(console.error);
};
export var LoadingHTML = loadHtmls(document.body);
