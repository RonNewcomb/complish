export default class extends HTMLElement {
    constructor() {
        super();
        try {
            const html = this.innerHTML;
            this.innerHTML = '';
            const variableName = new RegExp("{{" + this.attributes[0].name + "}}", "g");
            let valueOrPropertyName = this.attributes[0].value;
            let value;
            if (valueOrPropertyName.startsWith('[') || valueOrPropertyName.startsWith('{')) {
                value = JSON.parse(valueOrPropertyName);
            }
            else if (valueOrPropertyName.match(/^[0123456789]/)) {
                value = parseInt(valueOrPropertyName);
            }
            else {
                let current = this;
                let tries = 100;
                do {
                    current = current.parentElement || current.parentNode?.host;
                    if (!tries--)
                        break;
                } while (current && current[valueOrPropertyName] === undefined);
                current = current || window;
                if (current[valueOrPropertyName] === undefined) {
                    console.log("for-each can't find ancestor with a property called", valueOrPropertyName);
                    return;
                }
                value = current[valueOrPropertyName];
            }
            if (typeof value === 'function')
                value = value();
            if (Array.isArray(value)) {
                const rendered = value.map(item => html.replace(variableName, item));
                this.insertAdjacentHTML("beforeend", rendered.join(""));
            }
            else if (typeof value === 'number') {
                const rendered = [];
                for (let i = 1; i <= value; i++)
                    rendered.push(html.replace(variableName, i.toString()));
                this.insertAdjacentHTML("beforeend", rendered.join(""));
            }
            else if (typeof value === 'object') {
                const rendered = Object.keys(value).map(item => html.replace(variableName, item));
                this.insertAdjacentHTML("beforeend", rendered.join(""));
            }
            else if (typeof value === 'boolean') {
                if (!!value)
                    this.insertAdjacentHTML("beforeend", html);
            }
            else {
                console.log("for-each received unknown value:", value);
            }
        }
        catch (e) {
            console.error(e);
        }
    }
}
