export const ask = (message, buttonLabels) => new Promise(async (resolve) => {
    if (!buttonLabels || !buttonLabels.length)
        buttonLabels = ["OK"];
    const modalDialogs = document.getElementsByTagName('modal-dialogs')[0];
    modalDialogs.buttons = buttonLabels;
    modalDialogs.insertAdjacentHTML('beforeend', template(message, buttonLabels));
    const modalDialog = modalDialogs.lastElementChild;
    for (let button of modalDialog.getElementsByTagName('button'))
        button.addEventListener('click', e => {
            resolve(e.currentTarget.innerText);
            modalDialog.remove();
        });
});
export default class ModalDialogs extends HTMLElement {
    constructor() {
        super();
        this.buttons = [];
        this.innerHTML = styles;
    }
}
const styles = `<style>
.modal-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 2px 2px 7px 2px tan;
  min-width: 10%;
  min-height: 2em;
  text-align: center;
  z-index: 5;
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: black;
  opacity: 0.2;
  z-index: 5;
}
.panel {
  background-color: hsl(39deg 77% 90%); /* "light wheat" */
  border-radius: 10px;
  border: 2px solid white;
  margin: 10px;
  padding: 14px;
}
</style>
`;
const template = (message, buttonLabels) => `
<div>
<div class="overlay"></div>
<div class="panel modal-dialog">
  <div>${message}</div>
  <div style="text-align: right">
    <for-each iter='buttons'>
      <button>{{iter}}</button>
    </for-each>
  </div>
</div>
</div> `;
