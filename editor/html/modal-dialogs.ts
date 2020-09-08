
declare global {
    interface Window {
        loadHtml(element: Element): Promise<Element>;
    }
}

export const ask = (message: string, buttonLabels?: string[]) =>
    new Promise<string>(async resolve => {
        if (!buttonLabels || !buttonLabels.length) buttonLabels = ["OK"];

        const container = document.getElementsByTagName('modal-dialogs')[0];
        container.insertAdjacentHTML('beforeend', `
        <modal-dialog message=${message}>
            <for-each iter='${JSON.stringify(buttonLabels)}'>
                <button>{{iter}}</button>
            </for-each>
        </modal-dialog>`);
        const modalDialogElement = await window.loadHtml(container.lastElementChild!);

        for (let button of modalDialogElement.getElementsByTagName('button'))
            button.addEventListener('click', e => {
                resolve((e.currentTarget! as HTMLElement).innerText);
                modalDialogElement.remove();
            });
    })
