module parser {

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

    var grammarRules: GrammarRule[] = [
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
        'DeVar -> N  XYZ',
        'DeVar -> NP  XYZ',
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

    function new_ParseForest(n: number): ParseForest {
        var pf = new Array(n);
        for (var i = 0; i < n; i++) {
            pf[i] = new Array(n);
            for (var j = 0; j < n; j++) 
                pf[i][j] = [/*to be size r*/];
        }
        return pf;
    }

    function makeKey(obj: GrammarRule | GrammarRule[]): GrammarKey {
        if (typeof obj === 'string') obj = [obj];
        return JSON.stringify(obj, null, 0);
    }

    function CYK(grammar: CompiledGrammar, str: string[]): ParseForest {
        var n = str.length + 1;
        var P = new_ParseForest(n);
        for (var i = 1; i < n; i++) {
            var token = str[i - 1];
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
                var UR = grammar[makeKey(token.toLowerCase())];
                for (var Rj in UR) {
                    P[i - 1][i].push(<ParseTreeLeaf>{
                        rule: UR[Rj],
                        token: token
                    });
                }
            }
            for (var j = i - 2; j >= 0; j--) {
                for (var k = j + 1; k < i; k++) {
                    var leftSubtreeRoots = P[j][k];
                    var rightSubtreeRoots = P[k][i];
                    for (var leftRootIndx in leftSubtreeRoots) {
                        for (var rightRootIndx in rightSubtreeRoots) {
                            var R = grammar[makeKey([leftSubtreeRoots[leftRootIndx]['rule'], rightSubtreeRoots[rightRootIndx]['rule']])];
                            if (R) {
                                for (var Ra in R) {
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

    var numNonterminals = 0;
    function compileGrammar(rules: GrammarRule[]): CompiledGrammar {
        var retval: CompiledGrammar = {};
        numNonterminals = 0;
        for (var i in rules) {
            var parts = rules[i].split('->');
            var productions = parts[1].split('|');
            for (var j in productions) {
                var key = makeKey(productions[j].trim().split(/\s+/));
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


    function traverseParseTable2(parseTable: ParseForest, left: number, right: number, rootIndex: number | string): string {
        if (!parseTable[left][right][rootIndex]['middle']) {
            return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + parseTable[left][right][rootIndex]['token'] + ' </span>';
        }
        return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + traverseParseTable2(parseTable, left, parseTable[left][right][rootIndex]['middle'], parseTable[left][right][rootIndex]['leftRootIndex']) + traverseParseTable2(parseTable, parseTable[left][right][rootIndex]['middle'], right, parseTable[left][right][rootIndex]['rightRootIndex']) + ' </span>';
    }

    function PrintPyramid(P: ParseForest, r: number, pieces: string[]): void {
        var n = pieces.length;
        var out = "";

        // reprint sentence
        var hasUnknownWord = false;
        out += "<span class='hasGrammarPopup'><span class='knownGrammar'>";
        for (var col = 0; col < n; col++) {
            var classes = "";
            for (var nonterminals = 0; nonterminals < r; nonterminals++) {
                if (P[col][col + 1][nonterminals])
                    classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
            }
            if (!classes) hasUnknownWord = true;
            out += "<span class='" + (classes || 'unknownWord') + "'> " + pieces[col] + "</span>";
        }
        out += ".&nbsp;&nbsp;&nbsp;</span>";
        if (!hasUnknownWord) out = out.replace('knownGrammar', 'unknownGrammar');

        out += "<table class='grammarPopup'><tr>";
        // reprint sentence
        for (var col = 0; col < n; col++) {
            var classes = "";
            for (var nonterminals = 0; nonterminals < r; nonterminals++) {
                if (P[col][col + 1][nonterminals])
                    classes += (classes == "" ? "" : " ") + P[col][col + 1][nonterminals].rule;
            }
            out += "<td class='" + classes + "'>" + pieces[col] + "</td>";
        }
        out += "</tr>";
        // inverted pyramid
        for (var row = n - 1; row >= 0; row--) {
            out += "<tr class='cellback'>";
            for (var col = 0; col <= row; col++) {
                var retval = "";
                var classes = "";
                for (var nonterminals = 0; nonterminals < r; nonterminals++) {
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
        out += "</table></span>";
        document.getElementById("main").innerHTML += out;
    }


    // run program

    var sentences = [
        'The woman eats the fish with the chopsticks before eating the fish with a fork',
        "To draw giving, do nothing",
        'The woman eats a fish with the chopsticks before eating the fish with a fork',
        "To draw giving a number to a number, do nothing",
        "Say",
        "To give a percentage to a number do nothing",
        "To say, give 10% to 21, give 10% to 21",
        "Say",
        "Give 3% to 2",
        "A numeric buggy drives a number",
        "To draw a vertical percentage by a horizontal percentage, draw",
        "To draw, give the percentage which 5 gave to 7",
        "Before drawing a number, give the number",
        "Draw a number before giving the number",
        "To give something to anything , do nothing",
        "A wheel is a number",
        "A car is many wheel, several percentage",
        "To give asap a numeric rank to just a percentage boldly,  do nothing",
        "Numeric horses are a charismatic number and a car",
        "Toby MacGuire is a charismatic number and a car",
        "A car is a textual make, a textual model, and a numeric year",
        //"Foospace begins here",
        "A car is a textual make, a textual model, and a numeric year",
        "To give a numeric rank to a percentage, do nothing",
        "To throw a numeric rank at a percentage, do nothing",
        "To give a numeric rank to a percentage, know the percentage, then know 12%",
        "To give a percentage a numeric rank a position, do nothing",
        "To give a percentage a numeric rank, do nothing",
        "A numeric power level gives a numeric rank to a percentage",
        "A numeric charisma is a numeric rank and a percentage",
        "A buggy is many wheel and a numeric rank",
        "Someone knows many someone",
        "To know a percentage, know the percentage",
        "To draw a percentage toward a percentage, do nothing",
        "To draw, say \"Hello World!\"",
        "To say a text, say the text",
        //"To draw twice, say "Hello""World""!"",
        //"To draw thrice, say """Hello"" world!"",
        //"To say nothing, say """,
        "To say trouble, give 10% to 21, give anything to anything",
        "To draw giving a number to a number, do nothing",
        "To give a number to a number, do nothing",
        "To know, draw",
        "To do: say nothing",
        "To choose, know the percentage which was given to 5",
        "To choose, know the percentage which 5 gave to 7",
        "To choose, know the percentage to which 5 gave 7",
        "The Corvette is a car",
        "The car is many number",
        "To draw giving, do nothing",
        "To draw choosing, do nothing",
        "To throw, draw giving 3 to 2",
        "To weave, draw giving a number to 2",
        "Giving a number to a number is an activity",
        "When a function reads a variable, change the variable to anything before invoking the function",
        'The woman eats the fish with the chopsticks before eating the fish with a fork',
    ];

    var compiledGrammar = compileGrammar(grammarRules);

    for (var eachS = 0; eachS < sentences.length; eachS++) {
        var sentence2 = DataSegment.LiftLiteralStrings(sentences[eachS]);
        var sentence = sentence2.replace(/,/g, ' , ').replace(/:/g, ' : ');//.replace(/  /g, ' ');

        var pieces = sentence.split(' ').filter(each => !each.match(/^\s*$/));
        var parseForest = CYK(compiledGrammar, pieces);
        //console.log(JSON.stringify(parseForest));

        if (parseForest[0][parseForest.length - 1].length == 0) {
            PrintPyramid(parseForest, numNonterminals, pieces);
        }
        else if (parseForest[0][parseForest.length - 1].length > 1) {
            document.getElementById("main").innerHTML += "Error -- multiple interpretations match.";
            for (var i in parseForest[0][parseForest.length - 1]) {
                document.getElementById("main").innerHTML += '<span class="sentence">' + traverseParseTable2(parseForest, 0, parseForest.length - 1, i) + '</span>';
            }
        }
        else {
            for (var i in parseForest[0][parseForest.length - 1]) {
                document.getElementById("main").innerHTML += '<span class="sentence">' + traverseParseTable2(parseForest, 0, parseForest.length - 1, i) + '.&nbsp;&nbsp;&nbsp;</span>';
            }
        }
    }

}
