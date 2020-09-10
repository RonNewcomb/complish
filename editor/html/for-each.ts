
export default class extends HTMLElement {
  constructor() {
    super();
    const html = this.innerHTML;
    this.innerHTML = '';
    const command = this.attributes[0];
    const variableName = new RegExp("{{" + command.name + "}}", "g");
    const valueOrPropertyName = JSON.parse(command.value);
    if (Array.isArray(valueOrPropertyName)) {
      const rendered = valueOrPropertyName.map(item => html.replace(variableName, item));
      this.insertAdjacentHTML("beforeend", rendered.join(""));
    } else {
      console.log("no array");
      // let current = this.parentElement || this.getRootNode()?.host;
      // while (current && (!current.shadowRoot || !current.shadowRoot[array]))
      //   current = this.parentElement || this.getRootNode()?.host;
      // current = current || window;
    }
  }
}
