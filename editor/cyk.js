function init() {

grammar = [
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
    'colon ->  , ', // anywhere you can use a colon, you can use a comma
    'comma ->  , ',
    'Conj ->  , ',
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


function create2dArray(dim) {
    var arr = new Array(dim);
    for (var i = 0; i < dim; i++) {
        arr[i] = new Array(dim);
        for (var j = 0; j < dim; j++) {
            arr[i][j] = [];
        }
    }
    return arr;
}

function makeKey(obj) {
    if (typeof obj === 'string') obj = [obj];
    return JSON.stringify(obj, null, 0);    
}

function parse(grammar, tokens) {
    var tokLen = tokens.length + 1;
    var parseTable = create2dArray(tokLen);
    for (var right = 1; right < tokLen; right++) {
        var token = tokens[right - 1];
        var terminalRules = grammar[makeKey(token)];
        for (var r in terminalRules) {
            var rule = terminalRules[r];
            parseTable[right - 1][right].push({
                rule: rule,
                token: token
            });
        }
        for (var left = right - 2; left >= 0; left--) {
            for (var mid = left + 1; mid < right; mid++) {
                var leftSubtreeRoots = parseTable[left][mid];
                var rightSubtreeRoots = parseTable[mid][right];
                for (var leftRootIndx in leftSubtreeRoots) {
                    for (var rightRootIndx in rightSubtreeRoots) {
                        var rls = grammar[makeKey([leftSubtreeRoots[leftRootIndx]['rule'],  rightSubtreeRoots[rightRootIndx]['rule']])];
                        if (rls) {
                            for (var r in rls) {
                                parseTable[left][right].push({
                                    rule: rls[r],
                                    middle: mid,
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
    return parseTable;
}

function grammarToHashMap(rules) {
    var hashMap = {};
    for (var i in rules) {
        var rule = rules[i];
        var parts = rule.split('->');
        var root = parts[0].trim();
        
        var productions = parts[1].split('|');
        for(var j in productions) {
            var childs = (productions[j].trim()).split(/\s+/);
            var key = makeKey(childs);
            if (!hashMap[key]) {
                hashMap[key] = [];
            }
            hashMap[key].push(root);    
        }        
    }
    return hashMap;
}


function traverseParseTable2(parseTable, left, right, rootIndex) {
    if (!parseTable[left][right][rootIndex]['middle']) {
        return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + parseTable[left][right][rootIndex]['token'] + ' </span>';
    }
    return '<span class="' + parseTable[left][right][rootIndex]['rule'] + '">' + traverseParseTable2(parseTable, left, parseTable[left][right][rootIndex]['middle'], parseTable[left][right][rootIndex]['leftRootIndex']) + traverseParseTable2(parseTable, parseTable[left][right][rootIndex]['middle'], right, parseTable[left][right][rootIndex]['rightRootIndex']) + ' </span>';
}

// run program

var input = 'The woman eats the fish with the chopsticks before eating the fish with a fork'

var ghmp = grammarToHashMap(grammar);
console.log(ghmp);
var parseTable = parse(ghmp, input.toLowerCase().split(' '));
console.log(JSON.stringify(parseTable));

if (parseTable[0][parseTable.length - 1].length == 0) 
  document.body.innerHTML += "Error.";
else
  for (var i in parseTable[0][parseTable.length - 1]) {
      document.body.innerHTML += '<div class="tree" id="displayTree"><span class="sentence">' + traverseParseTable2(parseTable, 0, parseTable.length - 1, i) + '</span></div><br/>';
  }

}
