customElements.define('for-each',
  class extends HTMLElement {
    constructor() {
      try {
        super();
        const html = this.innerHTML;
        this.innerHTML = '';

        // find the iteration var and val
        let attr: Attr | null = null;
        let a = 0;
        do {
          attr = this.attributes[a];
        } while (['class', 'style'].includes(attr.name));
        if (!attr) {
          console.log("for-each lacks attribute that isn't class or style");
          return;
        }
        const variableName = new RegExp("{{" + attr.name + "}}", "g");
        let valueOrPropertyName = attr.value;

        // is the value a literal or a property of an ancestor element?
        let value: any;
        if (valueOrPropertyName.startsWith('[') || valueOrPropertyName.startsWith('{')) { // hard-coded literal array
          value = JSON.parse(valueOrPropertyName);
        } else if (valueOrPropertyName.match(/^[0123456789]/)) { // hard-coded number
          value = parseInt(valueOrPropertyName);
        } else {                                         // assume property
          let current: Element = this;
          let tries = 100;
          do {
            current = current.parentElement || (current.parentNode as ShadowRoot)?.host;
            if (!tries--) break;
          } while (current && current[valueOrPropertyName] === undefined)
          current = current || window;
          if (current[valueOrPropertyName] === undefined) {
            console.log("for-each can't find ancestor with a property called", valueOrPropertyName);
            return;
          }
          value = current[valueOrPropertyName];
        }

        // if property is function, call it to get the value
        if (typeof value === 'function')
          value = value();

        // iterate on the value
        if (Array.isArray(value)) {
          const rendered = value.map(item => html.replace(variableName, item));
          this.insertAdjacentHTML("beforeend", rendered.join(""));
        } else if (typeof value === 'number') {
          const rendered = [];
          for (let i = 1; i <= value; i++)
            rendered.push(html.replace(variableName, i.toString()));
          this.insertAdjacentHTML("beforeend", rendered.join(""));
        } else if (typeof value === 'object') {
          const rendered = Object.keys(value).map(item => html.replace(variableName, item));
          this.insertAdjacentHTML("beforeend", rendered.join(""));
        } else if (typeof value === 'boolean') {
          if (!!value)
            this.insertAdjacentHTML("beforeend", html);
        } else {
          console.log("for-each received unknown value:", value);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
);