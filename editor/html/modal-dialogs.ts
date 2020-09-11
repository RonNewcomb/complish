import { loadHtml } from '../code/loader.js';

export const ask = (message: string, buttonLabels?: string[]) =>
    new Promise<string>(async resolve => {
        if (!buttonLabels || !buttonLabels.length) buttonLabels = ["OK"];

        const container = document.getElementsByTagName('modal-dialogs')[0];
        (container as ModalDialogs).buttons = buttonLabels;
        container.insertAdjacentHTML('beforeend', `
        <modal-dialog message=${message}>
            <for-each iter='buttons'>
                <button>{{iter}}</button>
            </for-each>
        </modal-dialog>`);
        const modalDialogElement = await loadHtml(container.lastElementChild!);

        for (let button of modalDialogElement.getElementsByTagName('button'))
            button.addEventListener('click', e => {
                resolve((e.currentTarget! as HTMLElement).innerText);
                modalDialogElement.remove();
            });
    })

export default class ModalDialogs extends HTMLElement {
    buttons: string[] = [];
    constructor() { super(); }
}
