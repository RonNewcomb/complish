
const alreadyLoadingTheFirstInstance = {};

export const loadHtmls = (element: Element): Promise<any> =>
    Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));

export const loadHtml = async (element: Element): Promise<Element> => {
    let tag = element.tagName.toLowerCase();
    if (alreadyLoadingTheFirstInstance[tag]) {
        await alreadyLoadingTheFirstInstance[tag];
        return loadInstance(element, tag);
    } // else this is the first instance
    alreadyLoadingTheFirstInstance[tag] = loadInstance(element, tag);
    return alreadyLoadingTheFirstInstance[tag];
}

const loadInstance = async (element: Element, tag: string): Promise<Element> => {
    let path = tag.replace(/--/g, "/");
    let template: HTMLTemplateElement | null | void = document.head.querySelector(tag) as HTMLTemplateElement;
    let module: any = null;

    // console.log(1, tag, "has", "module", !!module, "template", !!template);

    if (!template) {
        const html = await fetch(`html/${path}.html`).catch(console.error).then(r => r && r.ok ? r.text() : "<template><slot></slot></template>");
        template = new DOMParser().parseFromString(html, 'text/html').head.querySelector('template') || new HTMLTemplateElement();
        template.id = tag;
        document.head.appendChild(template);
    }

    // console.log(2, tag, "has", "module", !!module, "template", !!template);

    module = customElements.get(tag);
    if (!module) {
        module = await import(`../html/${path}.js`).catch(console.error);
        if (!module || !module.default) module = { default: class extends HTMLElement { } };
        customElements.define(tag, module.default);
    }

    // console.log(3, tag, "has", "module", !!module, "template", !!template);

    if (module && template)
        element.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));

    // console.log(4, tag, "has", "module", !!module, "template", !!template);

    return loadHtmls(element);
}

export var LoadingHTML = loadHtmls(document.body);

