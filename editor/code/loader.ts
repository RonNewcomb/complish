
const alreadyLoadingTheFirstInstance = {};

export const scanChildren = (element: Element): Promise<any> => {
    const allChildren = Array.from(element.children).concat(Array.from(element.shadowRoot?.children || []));
    return Promise.all(allChildren.map(child => child.tagName.includes("-") ? loadHtml(child) : scanChildren(child)));
}

export const loadHtml = async (element: Element): Promise<Element> => {
    let tag = element.tagName.toLowerCase();
    if (alreadyLoadingTheFirstInstance[tag]) {
        await alreadyLoadingTheFirstInstance[tag];
        return loadInstance(element, tag);
    } // else this IS the first instance
    alreadyLoadingTheFirstInstance[tag] = loadInstance(element, tag);
    return alreadyLoadingTheFirstInstance[tag];
}

const loadInstance = async (element: Element, tag: string): Promise<Element> => {
    let path = tag.replace(/--/g, "/");
    let template: HTMLTemplateElement | null | void = document.head.querySelector(`template#${tag}`) as HTMLTemplateElement;

    if (!template) {
        const html = await fetch(`html/${path}.html`).catch(console.error).then(r => r && r.ok ? r.text() : "<template><slot></slot></template>");
        template = new DOMParser().parseFromString(html, 'text/html').head.querySelector('template') || new HTMLTemplateElement();
        template.id = tag;
        document.head.appendChild(template);
    }

    element.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));

    customElementsToDefine[tag] = true; // do this after all the attachShadow has happened
    // if (!customElements.get(tag)) {
    //     let module = await import(`../html/${path}.js`).catch(console.error);
    //     if (!module || !module.default) module = { default: class extends HTMLElement { } };
    //     customElements.define(tag, module.default);
    // }

    scanChildren(element);
    return element;
}

const customElementsToDefine = {};

export var LoadingHTML = scanChildren(document.body).then(_ =>
    Promise.all(
        Object.keys(customElementsToDefine).map(async tag => {
            let path = tag.replace(/--/g, "/");
            //console.log("looking for", tag);
            let module = await import(`../html/${path}.js`).catch(console.error);
            if (!module || !module.default) module = { default: class extends HTMLElement { } };
            customElements.define(tag, module.default);
            //console.log("Defined", tag);
            return tag;
        }))
);
