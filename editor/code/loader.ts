
export const scanChildren = (element: Element): Promise<any> => {
    const allChildren = Array.from(element.children).concat(Array.from(element.shadowRoot?.children || []));
    return Promise.all(allChildren.map(child => child.tagName.includes("-") ? loadHtml(child) : scanChildren(child)));
}

export const loadHtml = async (element: Element): Promise<Element> => {
    import(`../html/${element.tagName.toLowerCase().replace(/--/g, "/")}.js`).catch(console.error);
    /* await */scanChildren(element);
    return element;
}

export var LoadingHTML = scanChildren(document.body)
