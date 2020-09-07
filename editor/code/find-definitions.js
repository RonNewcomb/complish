export function findDefinitions() {
    const source = document.getElementById('main');
    console.log("finding definitions for ", source);
    const defuns = source.querySelectorAll('.sentence > .DeFun');
    console.log(defuns.length + " verbs defined");
}
