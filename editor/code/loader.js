export const loadHtmls = (element) => Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));
export const loadHtml = (element) => Promise.allSettled([
    fetch("html/" + element.tagName.replace(/--/g, "/") + ".html").then(res => res.text()).catch(err => ""),
    import("../html/" + element.tagName.replace(/--/g, "/") + ".js").catch(console.log),
]).then(async (responses) => {
    const [htmlP, codeP] = responses;
    const html = (htmlP.status === 'fulfilled') ? htmlP.value : "";
    const code = (codeP.status === 'fulfilled') ? codeP.value : undefined;
    const head = new DOMParser().parseFromString(html, 'text/html').head;
    const template = head.querySelector('template');
    const style = head.querySelector('style');
    const module = Object.assign(class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            if (template?.content)
                shadow.appendChild(document.importNode(template.content, true));
            if (style)
                shadow.appendChild(style.cloneNode(true));
        }
    }, code || {});
    customElements.define(element.tagName.toLowerCase(), module);
    loadHtmls(element);
}).catch(console.error);
