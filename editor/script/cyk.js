import * as DataSegment from "./dataSegment.js";
const grammarRules = [
    'V -> eats',
    'N -> fish | fork | chopsticks',
    'N -> woman',
    'G -> eating',
    'TR ->  aSV  DC',
    'TR ->  aSVO DC',
    'TR ->  aVO  DC',
    'TR ->  SV  DC',
    'TR ->  SVO  DC',
    'TR ->  VO  DC',
    'TR ->  body DC',
    'TR ->  DC  aSV',
    'TR ->  DC  aSVO',
    'TR ->  DC  aVO',
    'TR ->  DC  SV',
    'TR ->  DC  SVO',
    'TR ->  DC  VO',
    'TR ->  DC  body',
    'DC ->  SConj aGP',
    'DC ->  SConj GP',
    'aSV ->  aNP V',
    'aSV ->  aNP VP',
    'aSVO ->  aSV aNP',
    'aSVO ->  aSV aPP',
    'aSVO ->  aSV aNPPP',
    'Deconst -> N  XYZ',
    'Deconst -> NP  XYZ',
    'DeObj -> aNP  XYZ',
    'XYZ ->  IsHas aNP',
    'XYZ ->  IsHas NPs',
    'NPs ->  aNP  ConjNP',
    'ConjNP -> ConjNP ConjNP',
    'ConjNP -> Conj  aNP',
    'aVO ->  V  aNP',
    'aVO ->  V  aPP',
    'aVO ->  V  G',
    'aVO ->  V  aGP',
    'aVO ->  V  aNPPP',
    'tVO ->  IV colon',
    'tVO ->  IV aNP',
    'tVO ->  IV G',
    'tVO ->  IV aGP',
    'tVO ->  IV aPP',
    'tVO ->  IV aNPPP',
    'body ->  colon V',
    'body ->  colon SV',
    'body ->  colon SVO',
    'body ->  colon VO',
    'body ->  colon Ops',
    'Ops ->  V ConjOp',
    'Ops ->  SV   ConjOp',
    'Ops ->  SVO  ConjOp',
    'Ops ->  VO   ConjOp',
    'ConjOp -> Conj V',
    'ConjOp -> Conj SV',
    'ConjOp -> Conj SVO',
    'ConjOp -> Conj VO',
    'ConjOp -> ConjOp ConjOp',
    'DeFun -> tVO body',
    'DeFun -> tVO V',
    'DeFun -> tVO SV',
    'DeFun -> tVO SVO',
    'DeFun -> tVO VO',
    'DeFun -> tVO Ops',
    'SV ->  NP V',
    'SV ->  NP VP',
    'SV ->  NP G',
    'SV ->  NP aGP',
    'SVO ->  SV NP',
    'SVO ->  SV PP',
    'SVO ->  SV NPPP',
    'VO ->  V  NP',
    'VO ->  V  PP',
    'VO ->  V  G',
    'VO ->  V  aGP',
    'VO ->  V  NPPP',
    'aPP ->  aPP aPP',
    'aNPPP -> aNP aPP',
    'PP ->  PP PP',
    'NPPP -> NP PP',
    'paF ->  NP aPP',
    'paF ->  aNP PP',
    'paF ->  PP aPP',
    'paF ->  aPP PP',
    'paF ->  paF aPP',
    'paF ->  paF PP',
    'aNP -> G aNP',
    'aNP -> G aPP',
    'aNP -> G aNPPP',
    'NP -> G NP',
    'NP -> G PP',
    'NP -> G NPPP',
    'NP -> G paF',
    'aGP -> G aNP',
    'aGP -> G aPP',
    'aGP -> G aNPPP',
    'GP -> G NP',
    'GP -> G PP',
    'GP -> G NPPP',
    'GP -> G paF',
    'NP -> NP RC',
    'RC -> Rp SV',
    'RC -> Rp SVO',
    'RC -> Rp VO',
    'PP -> P NP',
    'aPP -> P aNP',
    'NP -> Def N ',
    'NP -> Def AdN',
    'aNP -> Det  N ',
    'aNP -> Det  AdN',
    'AdN -> Adj N ',
    'N ->  N  N ',
    'IV -> To V',
    'VP -> HV G',
    'V ->  V  Adv',
    'V ->  Adv V',
    'V -> is',
    'V -> are',
    'HV -> is',
    'HV -> was',
    'HV -> am',
    'HV -> are',
    'HV -> were',
    'IsHas -> is',
    'IsHas -> am',
    'IsHas -> are',
    'IsHas -> has',
    'IsHas -> have',
    'V -> reads',
    'V -> change',
    'V -> say',
    'V -> give',
    'V -> gave',
    'V -> keeps',
    'V -> draw',
    'V -> do',
    'V -> begins',
    'V -> begin',
    'V -> ends',
    'V -> end',
    'aNP -> anything',
    'aNP -> something',
    'aNP -> nothing',
    'NP -> nothing',
    'aNP -> someone',
    'N -> someone',
    'N -> number',
    'N -> percentage',
    'N -> money',
    'N -> position',
    'N -> boole',
    'N -> time',
    'N -> text',
    'N -> sequence',
    'Adj -> numeric',
    'Adj -> percent',
    'Adj -> monetary',
    'Adj -> ordinal',
    'Adj -> boolean',
    'Adj -> temporal',
    'Adj -> textual',
    'Adj -> sequential',
    'Adv -> here',
    'Rp -> which',
    'P -> with',
    'P -> about',
    'P -> at',
    'P -> toward',
    'P -> to',
    'To -> to',
    'P -> by',
    'colon -> by',
    'colon -> via',
    'Det -> a',
    'Det -> an',
    'Det -> many',
    'Det -> several',
    'Def -> the',
    'Def -> each',
    'Def -> every',
    'colon -> :',
    'colon -> ,',
    'comma -> ,',
    'Conj -> ,',
    'Conj -> then',
    'Conj -> and',
    'Conj -> either',
    'Conj -> or',
    'SConj -> before',
    'SConj -> after',
    'SConj -> until',
    'SConj -> unless',
    'SConj -> if',
    'SConj -> since',
    'SConj -> when',
    'SConj -> whenever',
    'SConj -> while',
];
function makeKey(obj) {
    if (typeof obj === 'string')
        obj = [obj];
    return JSON.stringify(obj, null, 0);
}
let numNonterminals = 0;
function compileGrammar(rules) {
    const retval = {};
    numNonterminals = 0;
    for (let i in rules) {
        const parts = rules[i].split('->');
        const productions = parts[1].split('|');
        for (let j in productions) {
            const key = makeKey(productions[j].trim().split(/\s+/));
            if (!retval[key]) {
                retval[key] = [];
                numNonterminals++;
            }
            retval[key].push(parts[0].trim());
        }
    }
    return retval;
}
const compiledGrammar = compileGrammar(grammarRules);
function new_ParseForest(n) {
    const pf = new Array(n);
    for (let i = 0; i < n; i++) {
        pf[i] = new Array(n);
        for (let j = 0; j < n; j++)
            pf[i][j] = [];
    }
    return pf;
}
function CYK(grammar, str) {
    const n = str.length + 1;
    const P = new_ParseForest(n);
    for (let i = 1; i < n; i++) {
        const token = str[i - 1];
        if (token[0] >= '0' && token[0] <= '9') {
            P[i - 1][i].push({
                rule: (token.indexOf('%') > -1) ? 'percentage' : 'number',
                token: token
            });
        }
        else if (token[0] === "_" && token.indexOf(DataSegment.LitStringPlaceholderPrefix) > -1) {
            P[i - 1][i].push({
                rule: 'N',
                token: token
            });
        }
        else {
            const UR = grammar[makeKey(token.toLowerCase())];
            for (let Rj in UR) {
                P[i - 1][i].push({
                    rule: UR[Rj],
                    token: token
                });
            }
        }
        for (let j = i - 2; j >= 0; j--) {
            for (let k = j + 1; k < i; k++) {
                const leftSubtreeRoots = P[j][k];
                const rightSubtreeRoots = P[k][i];
                for (let leftRootIndx in leftSubtreeRoots) {
                    for (let rightRootIndx in rightSubtreeRoots) {
                        const R = grammar[makeKey([leftSubtreeRoots[leftRootIndx]['rule'], rightSubtreeRoots[rightRootIndx]['rule']])];
                        if (R) {
                            for (let Ra in R) {
                                P[j][i].push({
                                    rule: R[Ra],
                                    middle: k,
                                    leftRootIndex: leftRootIndx,
                                    rightRootIndex: rightRootIndx
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    return P;
}
function traverseParseTable(parseTable, left, right, rootIndex) {
    let retval = ' <span class="' + parseTable[left][right][rootIndex]['rule'] + '">';
    if (parseTable[left][right][rootIndex]['middle']) {
        retval += traverseParseTable(parseTable, left, parseTable[left][right][rootIndex]['middle'], parseTable[left][right][rootIndex]['leftRootIndex']);
        retval += traverseParseTable(parseTable, parseTable[left][right][rootIndex]['middle'], right, parseTable[left][right][rootIndex]['rightRootIndex']);
    }
    else {
        retval += parseTable[left][right][rootIndex]['token'];
    }
    return retval + '</span>';
}
function PrintPyramid(P, r, pieces) {
    const n = pieces.length;
    let out = "";
    let hasUnknownWord = false;
    out += "<span class='hasGrammarPopup'><span class='knownGrammar'>";
    for (let col = 0; col < n; col++) {
        let classes = "";
        for (let nonterminals = 0; nonterminals < r; nonterminals++) {
            if (P[col][col + 1][nonterminals])
                classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
        }
        if (!classes)
            hasUnknownWord = true;
        out += " <span class='" + (classes || 'unknownWord') + "'>" + pieces[col] + "</span>";
    }
    out += ".</span>  ";
    if (!hasUnknownWord)
        out = out.replace('knownGrammar', 'unknownGrammar');
    out += "<table class='grammarPopup'><tr>";
    for (let col = 0; col < n; col++) {
        let classes = "";
        for (let nonterminals = 0; nonterminals < r; nonterminals++) {
            if (P[col][col + 1][nonterminals])
                classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
        }
        out += "<td class='" + classes + "'>" + pieces[col] + "</td>";
    }
    out += "</tr>";
    for (let row = n - 1; row >= 0; row--) {
        out += "<tr class='cellback'>";
        for (let col = 0; col <= row; col++) {
            let retval = "";
            let classes = "";
            for (let nonterminals = 0; nonterminals < r; nonterminals++) {
                if (P[col][n - row + col][nonterminals]) {
                    classes += (classes == "" ? "" : " ") + P[col][n - row + col][nonterminals].rule + "_cellback";
                    retval += (retval == "" ? "" : ",") + P[col][n - row + col][nonterminals].rule;
                }
            }
            if (retval) {
                if (retval.length <= 10)
                    out += "<td align=center colspan=" + (n - row) + " class='" + classes + "'>" + retval + "</td>";
                else
                    out += "<td align=center colspan=" + (n - row) + " class='" + classes + " hasTooltip'>*<span class='tooltip'>" + retval + "</span></td>";
                col += n - row - 1;
            }
            else
                out += "<td></td>";
        }
        out += "</tr>";
    }
    out += "</table></span> ";
    return out;
}
export function Complish(sentences, element) {
    for (let eachS = 0; eachS < sentences.length; eachS++) {
        const sentence2 = DataSegment.LiftLiteralStrings(sentences[eachS]);
        const sentence = sentence2.replace(/,/g, ' , ').replace(/:/g, ' : ');
        const pieces = sentence.split(' ').filter(each => !each.match(/^\s*$/));
        const parseForest = CYK(compiledGrammar, pieces);
        const interpretations = parseForest[0][parseForest.length - 1];
        if (interpretations.length == 0) {
            element.innerHTML += PrintPyramid(parseForest, numNonterminals, pieces);
        }
        else if (interpretations.length > 1) {
            element.innerHTML += "Error -- multiple interpretations match.";
            for (let i in interpretations) {
                element.innerHTML += '<span class="sentence">' + traverseParseTable(parseForest, 0, parseForest.length - 1, i) + '</span>';
            }
        }
        else {
            for (let i in interpretations) {
                element.innerHTML += '<span class="sentence">' + traverseParseTable(parseForest, 0, parseForest.length - 1, i) + '.</span>  ';
            }
        }
    }
}
