
export default class extends HTMLElement {
  parentCustomElement?: HTMLElement;

  constructor() {
    super();
    const me = this.parentCustomElement;
    if (!me) console.log("no me");
    else {
      const html = `{{innerHTML}}`;
      const command = me.attributes[0];
      const varRegex = new RegExp("{{" + command.name + "}}", "g");
      const array = JSON.parse(command.value);
      if (!Array.isArray(array)) console.log("no array");
      else {
        const rendered = array.map(item => html.replace(varRegex, item));
        me.insertAdjacentHTML("beforeend", rendered.join(""));
      }
    }
  }

}