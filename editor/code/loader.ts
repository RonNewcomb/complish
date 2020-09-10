
const alreadyLoadingTheFirstInstance = {};

export const scanChildren = (element: Element): Promise<any> => {
    //console.log(element.tagName, "showing children", element.children.length + (element.shadowRoot ? element.shadowRoot.children.length : 0));
    const allChildren = Array.from(element.children).concat(Array.from(element.shadowRoot?.children || []));
    return Promise.all(allChildren.map(child => child.tagName.includes("-") ? loadHtml(child) : scanChildren(child)));
}

export const loadHtml = async (element: Element): Promise<Element> => {
    let tag = element.tagName.toLowerCase();
    //console.log(tag, 'considering');
    if (alreadyLoadingTheFirstInstance[tag]) {
        //console.log(tag, "2nd instance pausing");
        await alreadyLoadingTheFirstInstance[tag];
        //console.log(tag, "2nd instance");
        return loadInstance(element, tag);
    } // else this is the first instance
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

    if (!customElements.get(tag)) {
        let module = await import(`../html/${path}.js`).catch(console.error);
        if (!module || !module.default) module = { default: class extends HTMLElement { } };
        customElements.define(tag, module.default);
    }

    scanChildren(element);
    return element;
}

export var LoadingHTML = scanChildren(document.body);

