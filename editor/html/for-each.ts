export const getValueFromAncestorProperty = (child: Element, valueOrPropertyName: string): any => {
  let tries = 100;
  do {
    child = child.parentElement || (child.parentNode as ShadowRoot)?.host;
  } while (child && child[valueOrPropertyName] === undefined && --tries)
  child = child || window;
  if (child[valueOrPropertyName] === undefined)
    console.log("Can't find ancestor with a property called", valueOrPropertyName);
  return child[valueOrPropertyName];
}

customElements.define('for-each',
  class extends HTMLElement {
    constructor() {
      super();
      const html = this.innerHTML;
      this.innerHTML = '';

      // find the iteration var and val
      const attr = Array.from(this.attributes).filter(a => !['class', 'style'].includes(a.name))[0];
      if (!attr) {
        console.log("for-each lacks attribute that isn't class or style");
        return;
      }
      const variableName = new RegExp("{{" + attr.name + "}}", "g");
      const literalValueOrPropertyName = attr.value;

      // is the value a literal or a property of an ancestor element?
      const valueOrMethod = (literalValueOrPropertyName.startsWith('[') || literalValueOrPropertyName.startsWith('{'))
        ? JSON.parse(literalValueOrPropertyName)                            // hard-coded literal array/object
        : (literalValueOrPropertyName.match(/^[0123456789]/))
          ? parseInt(literalValueOrPropertyName)                            // hard-coded number
          : getValueFromAncestorProperty(this, literalValueOrPropertyName); // else, string, is property of ancestor

      // if valueOrMethod is a method, call it to get the value
      const value = (typeof valueOrMethod === 'function') ? valueOrMethod() : valueOrMethod;

      // iterate on the value
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
  }
);