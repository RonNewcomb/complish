
import { ask } from "./modal-dialogs.js";

Array.from(document.querySelectorAll(".topbar .submenu > div")).forEach(el =>
  el.addEventListener("click", e => ask((e!.target! as any).innerText, ["OK", "Cancel"]).then(result => console.log("You chose", result)))
);

export default class extends HTMLElement {
  constructor() {
    super();
  }
};

