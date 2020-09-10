import { loadHtml } from '../code/loader.js';
export const ask = (message, buttonLabels) => new Promise(async (resolve) => {
    if (!buttonLabels || !buttonLabels.length)
        buttonLabels = ["OK"];
    const container = document.getElementsByTagName('modal-dialogs')[0];
    container.insertAdjacentHTML('beforeend', `
        <modal-dialog message=${message}>
            <for-each iter='${JSON.stringify(buttonLabels)}'>
                <button>{{iter}}</button>
            </for-each>
        </modal-dialog>`);
    const modalDialogElement = await loadHtml(container.lastElementChild);
    console.log(modalDialogElement);
    for (let button of modalDialogElement.getElementsByTagName('button'))
        button.addEventListener('click', e => {
            resolve(e.currentTarget.innerText);
            modalDialogElement.remove();
        });
});
export default class extends HTMLElement {
    constructor() { super(); }
}
