interface Listeners {
    [key: string]: EventListenerOrEventListenerObject;
}

interface Component {
    template: HTMLTemplateElement;
    style: HTMLStyleElement;
    script: HTMLScriptElement;
    listeners: Listeners;
}

const loadHtmls = (element: Element, parentCustomElement: Element): Promise<any> =>
    Promise.allSettled(Array.from(element.children).map(child => child.tagName.includes("-") ? loadHtml(child, element) : loadHtmls(child, parentCustomElement)));

const loadHtml = (element: Element, parentCustomElement: Element): Promise<any> =>
    fetch("html/" + element.tagName.replace(/--/g, "/") + ".html")
        .then(response => response.text())
        .then(async html => {
            const head = new DOMParser().parseFromString(html, 'text/html').head;
            const comp = <Component>{
                template: head.querySelector('template'),
                style: head.querySelector('style'),
                script: head.querySelector('script'),
            };
            if (comp.script && comp.script.textContent) {
                const blob = new Blob([comp.script.textContent], { type: "application/javascript" });
                const url = URL.createObjectURL(blob);
                const module = await import(url).catch(e => console.error(element.tagName, e));
                if (module && module.default)
                    comp.listeners = Object.entries(module.default).reduce((listeners, [setting, value]) => {
                        if (setting.startsWith("on")) listeners[setting[2].toLowerCase() + setting.substr(3)] = value;
                        return listeners;
                    }, {});
            }
            customElements.define(element.tagName.toLowerCase(), class extends HTMLElement {
                parentCustomElement: Element = parentCustomElement;
                connectedCallback() {
                    const shadow = this.attachShadow({ mode: 'open' });
                    if (comp.style) shadow.appendChild(comp.style.cloneNode(true));
                    if (comp.template?.content) shadow.appendChild(document.importNode(comp.template.content, true));
                    if (comp.listeners) Object.entries(comp.listeners).forEach(([event, listener]) => this.addEventListener(event, listener, false));
                }
            });
            loadHtmls(element, element);
        });

loadHtmls(document.body, document.body);
