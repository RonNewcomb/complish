import { ask } from "./modal-dialogs.js";
Array.from(document.querySelectorAll(".topbar .submenu > div")).forEach(el => el.addEventListener("click", e => ask(e.target.innerText, ["OK", "Cancel"]).then(result => console.log("You chose", result))));
export default {
    init() {
        console.log("main-menu init");
    }
};
