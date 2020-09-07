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
        glossary[verb].push({ params: {}, body: defun.querySelector('.tVO') });
    });
    return glossary;
}
export function formatForDisplay(glossary) {
    const retval = Object.keys(glossary).sort((a, b) => a.localeCompare(b)).map(verb => {
        const about = glossary[verb];
        return about.map((def, i) => `
                <div class=term title='${def.body.textContent}'>
                    ${verb}${about.length > 1 ? `<sup>${i + 1}</sup>` : ''}
                </div>`).join('');
    });
    return retval.join('');
}
