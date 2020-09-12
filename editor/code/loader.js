export const scanChildren = (element) => {
    const allChildren = Array.from(element.children).concat(Array.from(element.shadowRoot?.children || []));
    return Promise.all(allChildren.map(child => child.tagName.includes("-") ? loadHtml(child) : scanChildren(child)));
};
export const loadHtml = async (element) => {
    let tag = element.tagName.toLowerCase();
    let path = tag.replace(/--/g, "/");
    if (!customElements.get(tag)) {
        let module = await import(`../html/${path}.js`).catch(console.error);
        if (module && module.default && !customElements.get(tag))
            customElements.define(tag, module.default);
    }
    scanChildren(element);
    return element;
};
export var LoadingHTML = scanChildren(document.body);
