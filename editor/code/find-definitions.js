export function findDefinitions() {
    const source = document.getElementById('main');
    console.log("finding definitions for ", source);
    const glossary = {};
    const defuns = Array.from(source.querySelectorAll('.sentence > .DeFun'));
    console.log(defuns.length + " verbs defined");
    defuns.forEach(defun => {
        const verb = defun.querySelector('.tVO .IV .V')?.textContent;
        if (!verb)
            return console.error("couldn't find verb for defun ", defun);
        if (!glossary[verb])
            glossary[verb] = [];
        glossary[verb].push();
    });
    return glossary;
}
export function formatForDisplay(glossary) {
    const retval = Object.keys(glossary).sort((a, b) => a.localeCompare(b)).map(verb => {
        return `<div class=term>${verb} ${glossary[verb].length > 1 ? `(${glossary[verb].length > 1})` : ''}<div>${glossary[verb].map(ps => `<div>${ps}</div>`).join('')}</div></div>`;
    });
    return retval.join('');
}
