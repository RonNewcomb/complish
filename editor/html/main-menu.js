import { ask } from "./modal-dialogs.js";
export default class extends HTMLElement {
    constructor() {
        super();
        this.shadowRoot.querySelectorAll('.topbar .submenu > div').forEach(el => el.addEventListener("click", e => ask(e.target.innerText, ["OK", "Cancel"]).then(result => console.log("You chose", result))));
    }
}
;
