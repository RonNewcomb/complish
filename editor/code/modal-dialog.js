const modals = document.createElement('div');
modals.id = 'modals';
document.body.appendChild(modals);
export const ask = (message, buttonLabels) => new Promise(async (resolve) => {
    if (!buttonLabels.length)
        buttonLabels = ["OK"];
    const modal = document.createElement('modal-dialog');
    modal.setAttribute('message', message);
    modal.innerHTML = `<div>${buttonLabels.map(label => `<button>${label}</button>`).join(' ')}</div>`;
    document.getElementById('modals').appendChild(modal);
    const modalDialogElement = await window.loadHtml(modal);
    const resolveAndRemove = (e) => {
        resolve(e.currentTarget.innerText);
        modalDialogElement.remove();
    };
    for (let button of modalDialogElement.getElementsByTagName('button'))
        button.addEventListener('click', resolveAndRemove, { once: true });
});
