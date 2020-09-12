export const getValueFromAncestorProperty = (child, valueOrPropertyName) => {
    let tries = 100;
    do {
        child = child.parentElement || child.parentNode?.host;
    } while (child && child[valueOrPropertyName] === undefined && --tries);
    child = child || window;
    if (child[valueOrPropertyName] === undefined)
        console.log("Can't find ancestor with a property called", valueOrPropertyName);
    return child[valueOrPropertyName];
};
customElements.define('for-each', class extends HTMLElement {
    constructor() {
        super();
        const html = this.innerHTML;
        this.innerHTML = '';
        const attr = Array.from(this.attributes).filter(a => !['class', 'style'].includes(a.name))[0];
        if (!attr) {
            console.log("for-each lacks attribute that isn't class or style");
            return;
        }
        const variableName = new RegExp("{{" + attr.name + "}}", "g");
        const literalValueOrPropertyName = attr.value;
        const valueOrMethod = (literalValueOrPropertyName.startsWith('[') || literalValueOrPropertyName.startsWith('{'))
            ? JSON.parse(literalValueOrPropertyName)
            : (literalValueOrPropertyName.match(/^[0123456789]/))
                ? parseInt(literalValueOrPropertyName)
                : getValueFromAncestorProperty(this, literalValueOrPropertyName);
        const value = (typeof valueOrMethod === 'function') ? valueOrMethod() : valueOrMethod;
        const rendered = Array.isArray(value)
            ? value.map(item => html.replace(variableName, item))
            : (typeof value === 'number')
                ? [...Array(value)].map((_, i) => html.replace(variableName, (i + 1).toString()))
                : (typeof value === 'boolean')
                    ? [!!value ? html : '']
                    : (value === null)
                        ? []
                        : (typeof value === 'object')
                            ? Object.keys(value).map(item => html.replace(variableName, item))
                            : undefined;
        if (rendered)
            this.insertAdjacentHTML("beforeend", rendered.join(""));
        else
            console.log("for-each received unsupported value", value, "(typeof", typeof value + ")");
    }
});
