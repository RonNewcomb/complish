interface Listeners {
    [key: string]: EventListenerOrEventListenerObject;
}

interface Component {
    name: string;
    template: HTMLTemplateElement;
    style: HTMLStyleElement;
    script: HTMLScriptElement;
    listeners: Listeners;
}

const loadHtmls = (element: Element): Promise<any> =>
    Promise.allSettled(Array.from(element.children).map(child => (child.tagName.includes("-") ? loadHtml : loadHtmls)(child)));

const loadHtml = (element: Element): Promise<any> =>
    fetch("html/" + element.tagName + ".html")
        .then(response => response.text())
        .then(html => new DOMParser().parseFromString(html, 'text/html').head)
        .then(head => <Component>{
            template: head.querySelector('template'),
            style: head.querySelector('style'),
            script: head.querySelector('script')
        })
        .then(comp => import(URL.createObjectURL(new Blob([comp.script?.textContent || ""], { type: 'application/javascript' })))
            .then(module => <Component>{
                name: module.default.name,
                template: comp.template,
                style: comp.style,
                listeners: Object.entries(module.default).reduce((listeners, [setting, value]) => {
                    if (setting.startsWith('on')) listeners[setting[2].toLowerCase() + setting.substr(3)] = value;
                    return listeners;
                }, {}),
            }))
        .then(comp =>
            customElements.define(comp.name, class extends HTMLElement {
                connectedCallback() {
                    this._upcast();
                    this._attachListeners();
                }

                _upcast() {
                    const shadow = this.attachShadow({ mode: 'open' });
                    shadow.appendChild(comp.style.cloneNode(true));
                    shadow.appendChild(document.importNode(comp.template.content, true));
                }

                _attachListeners() {
                    Object.entries(comp.listeners).forEach(([event, listener]) => this.addEventListener(event, listener, false));
                }
            })
        );

loadHtmls(document.body);
