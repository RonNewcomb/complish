var parser;
(function (parser) {
    var grammarRules = [
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
        'aSV ->  aNP V',
        'aSV ->  aNP VP',
        'aSVO ->  aSV aNP',
        'aSVO ->  aSV aPP',
        'aSVO ->  aSV aNPPP',
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
        'aVO ->  V  aNP',
        'aVO ->  V  aPP',
        'aVO ->  V  G',
        'aVO ->  V  aGP',
        'aVO ->  V  aNPPP',
        // head of a definition function
        'tVO ->  IV colon',
        'tVO ->  IV aNP',
        'tVO ->  IV G',
        'tVO ->  IV aGP',
        'tVO ->  IV aPP',
        'tVO ->  IV aNPPP',
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
        'SV ->  NP V',
        'SV ->  NP VP',
        'SV ->  NP G',
        'SV ->  NP aGP',
        'SVO ->  SV NP',
        'SVO ->  SV PP',
        'SVO ->  SV NPPP',
        // invoke a relation-func
        'VO ->  V  NP',
        'VO ->  V  PP',
        'VO ->  V  G',
        'VO ->  V  aGP',
        'VO ->  V  NPPP',
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
        'N ->  N  N ',
        // basic verb pieces
        'IV -> To V',
        'VP -> HV G',
        'V ->  V  Adv',
        'V ->  Adv V',
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
        'V -> begins',
        'V -> begin',
        'V -> ends',
        'V -> end',
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
    function new_ParseForest(n) {
        var arr = new Array(n);
        for (var i = 0; i < n; i++) {
            arr[i] = new Array(n);
            for (var j = 0; j < n; j++) {
                arr[i][j] = [];
            }
        }
        return arr;
    }
    function makeKey(obj) {
        if (typeof obj === 'string')
            obj = [obj];
        return JSON.stringify(obj, null, 0);
    }
    function CYK(grammar, str) {
        var n = str.length + 1;
        var P = new_ParseForest(n);
        for (var i = 1; i < n; i++) {
            var token = str[i - 1];
            if (token[0] >= '0' && token[0] <= '9') {
                P[i - 1][i].push({
                    rule: (token.indexOf('%') > -1) ? 'percentage' : 'number',
                    token: token
                });
            }
            else {
                var UR = grammar[makeKey(token.toLowerCase())];
                for (var Rj in UR) {
                    P[i - 1][i].push({
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
    var numNonterminals = 0;
    function compileGrammar(rules) {
        var retval = {};
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
    function traverseParseTable2(parseTable, left, right, rootIndex) {
        if (!parseTable[left][right][rootIndex]['middle']) {
            return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + parseTable[left][right][rootIndex]['token'] + ' </span>';
        }
        return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + traverseParseTable2(parseTable, left, parseTable[left][right][rootIndex]['middle'], parseTable[left][right][rootIndex]['leftRootIndex']) + traverseParseTable2(parseTable, parseTable[left][right][rootIndex]['middle'], right, parseTable[left][right][rootIndex]['rightRootIndex']) + ' </span>';
    }
    function PrintPyramid(P, r, pieces) {
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
            if (!classes)
                hasUnknownWord = true;
            out += "<span class='" + (classes || 'unknownWord') + "'> " + pieces[col] + "</span>";
        }
        out += ".&nbsp;&nbsp;&nbsp;</span>";
        if (!hasUnknownWord)
            out = out.replace('knownGrammar', 'unknownGrammar');
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
        var sentence = sentences[eachS].replace(/,/g, ' , ').replace(/  /g, ' ');
        var pieces = sentence.split(' ');
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
})(parser || (parser = {}));