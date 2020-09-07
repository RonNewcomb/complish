import * as DataSegment from "./dataSegment.js";

interface Token extends String { }
interface GrammarRule extends String { }
interface ParseTreeLeaf {
    rule: GrammarRule;
    token: Token;
}
interface ParseTreeNode {
    rule: GrammarRule;
    middle: number;
    leftRootIndex: number | string;
    rightRootIndex: number | string;
}
interface ParseForest extends Array<Array<Array<ParseTreeNode | ParseTreeLeaf>>> { }
type GrammarKey = string;
interface CompiledGrammar {
    [key: string/*GrammarKey*/]: Array<Token>;
}

const grammarRules: GrammarRule[] = [
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

    // defines a dependent clause
    'DC ->  SConj aGP',
    'DC ->  SConj GP',

    // defines a relation-struct
    'aSV ->  aNP V', // 1 param
    'aSV ->  aNP VP', // 1 param
    'aSVO ->  aSV aNP', // 2 params incl. direct obj
    'aSVO ->  aSV aPP', // 2 params
    'aSVO ->  aSV aNPPP',// 3+ params

    // defines a relation-struct for is/has which takes params like NP NP NP NP and NP. 
    'Deconst -> N  XYZ',
    'Deconst -> NP  XYZ',
    'DeObj -> aNP  XYZ',
    'XYZ ->  IsHas aNP',
    'XYZ ->  IsHas NPs',
    'NPs ->  aNP  ConjNP',
    'ConjNP -> ConjNP ConjNP',
    'ConjNP -> Conj  aNP',

    // for use in temporal constraints
    'aVO ->  V  aNP', // 1 param incl. direct obj
    'aVO ->  V  aPP', // 1 param
    'aVO ->  V  G',  // 1 param of type parameterless-function
    'aVO ->  V  aGP', // 1 param of type function
    'aVO ->  V  aNPPP', // 2+ params

    // head of a definition function
    'tVO ->  IV colon', // 0 params
    'tVO ->  IV aNP',   // 1 param direct obj
    'tVO ->  IV G',  // 1 param of type parameterless-function 
    'tVO ->  IV aGP', // 1 param of type function 
    'tVO ->  IV aPP', // 1+ params all indirect objs
    'tVO ->  IV aNPPP', // 2+ params direct & indirect obj
    //'tVO ->  tVOcomma', // optional end-comma

    // body of defining a function
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

    // define an imperative function
    'DeFun -> tVO body',
    'DeFun -> tVO V',
    'DeFun -> tVO SV',
    'DeFun -> tVO SVO',
    'DeFun -> tVO VO',
    'DeFun -> tVO Ops',

    // invokes a relation-struct
    'SV ->  NP V',  // 1 param
    'SV ->  NP VP', // 1 param
    'SV ->  NP G',  // 1 param of type parameterless-function
    'SV ->  NP aGP', // 1 param of type function
    'SVO ->  SV NP', // 2 params incl. direct obj
    'SVO ->  SV PP', // 2 params
    'SVO ->  SV NPPP', // 3+ params

    // invoke a relation-func
    'VO ->  V  NP', // 1 param incl. direct obj
    'VO ->  V  PP', // 1 param
    'VO ->  V  G',  // 1 param of type parameterless-function
    'VO ->  V  aGP', // 1 param of type function
    'VO ->  V  NPPP', // 2+ params

    // list of PPs list of PP headed by a NP called the direct object. Mixed determinate/indeterminate is a partially-applied function
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

    // gerund phrase pieces, 0 params are in UnitRules
    'aNP -> G aNP', // 1 param
    'aNP -> G aPP', // 1+ params
    'aNP -> G aNPPP', // 2+ params
    'NP -> G NP',  // 1 param
    'NP -> G PP',  // 1+ params
    'NP -> G NPPP', // 2+ params
    'NP -> G paF', // 
    'aGP -> G aNP', // 1 param
    'aGP -> G aPP', // 1+ params
    'aGP -> G aNPPP', // 2+ params
    'GP -> G NP',  // 1 param
    'GP -> G PP',  // 1+ params
    'GP -> G NPPP', // 2+ params
    'GP -> G paF', // 

    // relative clauses with the relative pronoun (Rp) "which"
    'NP -> NP RC',
    'RC -> Rp SV',
    'RC -> Rp SVO',
    'RC -> Rp VO',

    // basic preposition pieces, determinate & indeterminate
    'PP -> P NP',
    'aPP -> P aNP',

    // basic noun pieces, determinate & indeterminate forms of each
    'NP -> Def N ',
    'NP -> Def AdN',
    'aNP -> Det  N ',
    'aNP -> Det  AdN',
    'AdN -> Adj N ',
    'N ->  N  N ', // nouns(types) can be multi-word

    // basic verb pieces
    'IV -> To V', // to find a person: infinitive phrase as adverbial phrase 
    'VP -> HV G', // is going
    'V ->  V  Adv', // absorb adverbs
    'V ->  Adv V', // absorb adverbs


    // Unit / Terminal Rules //////////////////////

    //'G  , s => s.EndsWith("ing") && s != t.Nothing && s != t.Anything && s != t.Something';
    //'NP, s => (0 <= (short)s[0] - ascii0) && ((short)s[0] - ascii0 <= 9)';
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

    // for examples only
    'V -> reads',
    'V -> change',
    'V -> say',
    'V -> give',
    'V -> gave',
    'V -> keeps',
    'V -> draw',
    'V -> do',
    'V -> begins', // reserved word?
    'V -> begin', // reserved?
    'V -> ends', // reserved word?
    'V -> end', // reserved?

    // built-in types
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

    // functor words
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
    'colon -> ,', // anywhere you can use a colon, you can use a comma
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

function makeKey(obj: GrammarRule | GrammarRule[]): GrammarKey {
    if (typeof obj === 'string') obj = [obj];
    return JSON.stringify(obj, null, 0);
}

let numNonterminals = 0;
function compileGrammar(rules: GrammarRule[]): CompiledGrammar {
    const retval: CompiledGrammar = {};
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
    //console.log(retval);
    return retval;
}

const compiledGrammar = compileGrammar(grammarRules);

function new_ParseForest(n: number): ParseForest {
    const pf = new Array(n);
    for (let i = 0; i < n; i++) {
        pf[i] = new Array(n);
        for (let j = 0; j < n; j++)
            pf[i][j] = [/*to be size r*/];
    }
    return pf;
}

function CYK(grammar: CompiledGrammar, str: string[]): ParseForest {
    const n = str.length + 1;
    const P = new_ParseForest(n);
    for (let i = 1; i < n; i++) {
        const token = str[i - 1];
        if (token[0] >= '0' && token[0] <= '9') {  // quick check: is it a numeric literal?
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
                P[i - 1][i].push(<ParseTreeLeaf>{
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
                                P[j][i].push(<ParseTreeNode>{
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

function traverseParseTable(parseTable: ParseForest, left: number, right: number, rootIndex: number | string): string {
    const retval = [' <span class="', parseTable[left][right][rootIndex]['rule'], '">'];
    if (parseTable[left][right][rootIndex]['middle']) {
        retval.push(traverseParseTable(parseTable, left, parseTable[left][right][rootIndex]['middle'], parseTable[left][right][rootIndex]['leftRootIndex']));
        retval.push(traverseParseTable(parseTable, parseTable[left][right][rootIndex]['middle'], right, parseTable[left][right][rootIndex]['rightRootIndex']));
    } else {
        retval.push(parseTable[left][right][rootIndex]['token']);
    }
    retval.push('</span>')
    return retval.join('');
}

function PrintPyramid(P: ParseForest, r: number, pieces: string[]): string {
    const n = pieces.length;
    const retval: string[] = [];

    // reprint sentence
    let hasUnknownWord = false;
    retval.push("<span class='hasGrammarPopup'><span class='knownGrammar'>");
    for (let col = 0; col < n; col++) {
        let classes = "";
        for (let nonterminals = 0; nonterminals < r; nonterminals++) {
            if (P[col][col + 1][nonterminals])
                classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
        }
        if (!classes) hasUnknownWord = true;
        retval.push(" <span class='", classes || 'unknownWord', "'>", pieces[col], "</span>");
    }
    retval.push(".  ");
    if (hasUnknownWord) retval[0] = retval[0].replace('knownGrammar', 'unknownGrammar');

    retval.push("<table class='grammarPopup'><tr>");
    // reprint sentence
    for (let col = 0; col < n; col++) {
        let classes = "";
        for (let nonterminals = 0; nonterminals < r; nonterminals++) {
            if (P[col][col + 1][nonterminals])
                classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
        }
        retval.push("<td class='", classes, "'>", pieces[col], "</td>");
    }
    retval.push("</tr>");
    // inverted pyramid
    for (let row = n - 1; row >= 0; row--) {
        retval.push("<tr class='cellback'>");
        for (let col = 0; col <= row; col++) {
            let partsOfSpeechAbbreviations = "";
            let classes = "";
            for (let nonterminals = 0; nonterminals < r; nonterminals++) {
                if (P[col][n - row + col][nonterminals]) {
                    classes += (classes == "" ? "" : " ") + P[col][n - row + col][nonterminals].rule + "_cellback";
                    partsOfSpeechAbbreviations += (partsOfSpeechAbbreviations == "" ? "" : ",") + P[col][n - row + col][nonterminals].rule;
                }
            }
            if (partsOfSpeechAbbreviations) {
                const colspan = n - row;
                retval.push("<td align=center colspan=", colspan.toString(), " class='", classes);
                if (partsOfSpeechAbbreviations.length <= 10)
                    retval.push("'>", partsOfSpeechAbbreviations, "</td>");
                else
                    retval.push("' title='", partsOfSpeechAbbreviations, "'>*</td>");
                col += colspan - 1;
            }
            else
                retval.push("<td></td>");
        }
        retval.push("</tr>");
    }
    retval.push("</table></span></span> ");
    return retval.join('');
}

export function Complish(sentences: string[]): string {
    const retval: string[] = [];
    for (let eachS = 0; eachS < sentences.length; eachS++) {
        const sentence2 = DataSegment.LiftLiteralStrings(sentences[eachS]);
        const sentence = sentence2.replace(/,/g, ' , ').replace(/:/g, ' : ');//.replace(/  /g, ' ');

        const pieces = sentence.split(' ').filter(each => !each.match(/^\s*$/));
        const parseForest = CYK(compiledGrammar, pieces);
        // console.log(JSON.stringify(parseForest));

        const interpretations = parseForest[0][parseForest.length - 1];
        if (interpretations.length == 0)
            retval.push(PrintPyramid(parseForest, numNonterminals, pieces));
        else if (interpretations.length > 1) {
            retval.push("Error -- multiple interpretations match.");
            for (let i in interpretations)
                retval.push('<span class="sentence">', traverseParseTable(parseForest, 0, parseForest.length - 1, i), '</span>');
        }
        else
            for (let i in interpretations)
                retval.push('<span class="sentence">', traverseParseTable(parseForest, 0, parseForest.length - 1, i), '.</span>  ');
    }
    return retval.join('');
}