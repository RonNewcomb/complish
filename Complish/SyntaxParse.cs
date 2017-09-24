using System;
using System.Collections.Generic;
using System.Linq;

namespace Complish
{
	public enum NonTerminalSymbol
	{
		// determinate and indeterminate articles
		The = 0, a,

		// noun, preposition, gerund, verb, adjective, adverb, conjunction, subordinating conjunction, relative pronoun
		N, P, G, V, Adj, Adv, Conj, SConj, Rp,

		// phrases, determinate and indeterminate sets
		 NP,  PP,  GP, VP,
		aNP, aPP, aGP,

		// adjective-noun combo, NP-PP combos, partially-applied function (combination of 1+ aNP/aPP with 1+ NP/PP)
		AdN, NPPP, aNPPP, paF,

		// lists: list of NPs, list of Operations, an "an X, a Y and a Z" list, list delimiter
		NPs, ConjNP,
		Ops, ConjOp,
		XYZ,
		comma,

		// infinitive and helping verbs
		To, IV, IsHas, HV,

		// relative clause, dependent (subordinate) clause 
		RC, DC,

		// Subject-Verb, Subject-Verb-Object(s), Verb-Object(s)  (determinate and indeterminate)
		SV, SVO, VO,
		aSV, aSVO, aVO,

		// "to verb (params)", "by/via/:/,", imperative function body 
		tVO, colon, body,

		// temporal relation (whole sentence), define object, define function, define variable/instance
		TR, DeObj, DeFun, DeVar,

		Length
	};

	// these are a subset of the above. They are the "start symbols", or, represent an entire fully-parsed line.
	public enum Rs
	{
		ImperativeInvocationSVO = NonTerminalSymbol.SVO,		// imperative invocation.  
		ImperativeInvocationSV = NonTerminalSymbol.SV,		// imperative invocation.  
		ImperativeInvocationV = NonTerminalSymbol.V,			// imperative invocation.
		ImperativeInvocationVO = NonTerminalSymbol.VO,		// imperative invocation.  
		FunctionDefinition = NonTerminalSymbol.DeFun,	// define function with body.  "To give the X to the Y, try blah, blah, blah." 
		UnaryRelationDefinition = NonTerminalSymbol.aSV,	// Subject-Verb sentence. Indeterminate. Defines a relation-struct. "A person cares." Defines verb.
		RelationDefinition = NonTerminalSymbol.aSVO,	// Subject-Verb-Object(s) sentence. Indeterminate. Defines a relation-struct. "A person carries something for someone." Defines verb.
		TemporalConstraint = NonTerminalSymbol.TR,		// a larger sentence with a before/after
		ObjectDefinition = NonTerminalSymbol.DeObj,	// struct-relation definition. "A   X is a Y and a Z". Defines noun X.
		VarInstanceDefinition = NonTerminalSymbol.DeVar,	// struct-relation definition. "The X is a Y and a Z". Defines noun X. 
	};

	public class UnitRule
	{
		public NonTerminalSymbol headterm;
		public string TerminalSymbol;
		public UnitRule(NonTerminalSymbol leftside, string rightside)
		{ headterm = leftside; TerminalSymbol = rightside; }

		public UnitRule(NonTerminalSymbol leftside, Func<string, bool> findtype)
		{ headterm = leftside; TypeRule = findtype; }
		public Func<string, bool> TypeRule;
	}
	public class RewriteRule
	{
		public NonTerminalSymbol headterm;
		public NonTerminalSymbol term2;
		public NonTerminalSymbol term3;
		public RewriteRule(NonTerminalSymbol leftside, NonTerminalSymbol rightSide1, NonTerminalSymbol rightSide2)
		{ headterm = leftside; term2 = rightSide1; term3 = rightSide2; }
	}

	public class SyntaxParser
	{
		public ParseForest Sentence(string a)
		{
			ParseForest x = CYK(a);
			PrintPyramid(x);
			PrintBackpointerData(x);
			return x;
		}

		// when defining new identifiers, they'll be unknown by basic CYK. Here, we assume the new ident can be any of these.
		public static readonly List<NonTerminalSymbol> unknownWords = new List<NonTerminalSymbol> { NonTerminalSymbol.N, NonTerminalSymbol.V, NonTerminalSymbol.Adj, NonTerminalSymbol.Adv };

		public static readonly RewriteRule[] R = {
				// defines a temporal relation relating two sub-relations. Commutitive.
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.aSV,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.aSVO,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.aVO,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.SV,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.SVO,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.VO,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.body,		NonTerminalSymbol.DC),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.aSV),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.aSVO),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.aVO),	
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.SV),
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.SVO),
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.VO),
				new RewriteRule(NonTerminalSymbol.TR,		NonTerminalSymbol.DC,		NonTerminalSymbol.body),

				// defines a dependent clause
				new RewriteRule(NonTerminalSymbol.DC,		NonTerminalSymbol.SConj,	NonTerminalSymbol.aGP),	
				new RewriteRule(NonTerminalSymbol.DC,		NonTerminalSymbol.SConj,	NonTerminalSymbol.GP),	

				// defines a relation-struct
				new RewriteRule(NonTerminalSymbol.aSV,		NonTerminalSymbol.aNP, NonTerminalSymbol.V),	// 1 param
                new RewriteRule(NonTerminalSymbol.aSV,		NonTerminalSymbol.aNP, NonTerminalSymbol.VP),	// 1 param
                new RewriteRule(NonTerminalSymbol.aSVO,		NonTerminalSymbol.aSV, NonTerminalSymbol.aNP),	// 2 params incl. direct obj
                new RewriteRule(NonTerminalSymbol.aSVO,		NonTerminalSymbol.aSV, NonTerminalSymbol.aPP),	// 2 params
                new RewriteRule(NonTerminalSymbol.aSVO,		NonTerminalSymbol.aSV, NonTerminalSymbol.aNPPP),// 3+ params

				// defines a relation-struct for is/has, which takes params like NP, NP, NP, NP and NP. 
				new RewriteRule(NonTerminalSymbol.DeVar,	NonTerminalSymbol.N,		NonTerminalSymbol.XYZ),
				new RewriteRule(NonTerminalSymbol.DeVar,	NonTerminalSymbol.NP,		NonTerminalSymbol.XYZ),
				new RewriteRule(NonTerminalSymbol.DeObj,	NonTerminalSymbol.aNP,		NonTerminalSymbol.XYZ),
				new RewriteRule(NonTerminalSymbol.XYZ,		NonTerminalSymbol.IsHas,	NonTerminalSymbol.aNP),
				new RewriteRule(NonTerminalSymbol.XYZ,		NonTerminalSymbol.IsHas,	NonTerminalSymbol.NPs),
				new RewriteRule(NonTerminalSymbol.NPs,		NonTerminalSymbol.aNP,		NonTerminalSymbol.ConjNP),
				new RewriteRule(NonTerminalSymbol.ConjNP,	NonTerminalSymbol.ConjNP,	NonTerminalSymbol.ConjNP),
				new RewriteRule(NonTerminalSymbol.ConjNP,	NonTerminalSymbol.Conj,		NonTerminalSymbol.aNP),

				// for use in temporal constraints
                new RewriteRule(NonTerminalSymbol.aVO,		NonTerminalSymbol.V,  NonTerminalSymbol.aNP),	// 1 param incl. direct obj
                new RewriteRule(NonTerminalSymbol.aVO,		NonTerminalSymbol.V,  NonTerminalSymbol.aPP),	// 1 param
                new RewriteRule(NonTerminalSymbol.aVO,		NonTerminalSymbol.V,  NonTerminalSymbol.G),		// 1 param of type parameterless-function
                new RewriteRule(NonTerminalSymbol.aVO,		NonTerminalSymbol.V,  NonTerminalSymbol.aGP),	// 1 param of type function
                new RewriteRule(NonTerminalSymbol.aVO,		NonTerminalSymbol.V,  NonTerminalSymbol.aNPPP),	// 2+ params

				// head of a definition function
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.colon), // 0 params
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.aNP),   // 1 param, direct obj
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.G),		// 1 param of type parameterless-function 
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.aGP),	// 1 param of type function 
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.aPP),	// 1+ params, all indirect objs
                new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.IV, NonTerminalSymbol.aNPPP), // 2+ params, direct & indirect obj
                //new RewriteRule(NonTerminalSymbol.tVO,		NonTerminalSymbol.tVO,NonTerminalSymbol.comma), // optional end-comma

				// body of defining a function
                new RewriteRule(NonTerminalSymbol.body,		NonTerminalSymbol.colon, NonTerminalSymbol.V), 
                new RewriteRule(NonTerminalSymbol.body,		NonTerminalSymbol.colon, NonTerminalSymbol.SV), 
                new RewriteRule(NonTerminalSymbol.body,		NonTerminalSymbol.colon, NonTerminalSymbol.SVO), 
                new RewriteRule(NonTerminalSymbol.body,		NonTerminalSymbol.colon, NonTerminalSymbol.VO),
                new RewriteRule(NonTerminalSymbol.body,		NonTerminalSymbol.colon, NonTerminalSymbol.Ops), 
                new RewriteRule(NonTerminalSymbol.Ops,		NonTerminalSymbol.V,	NonTerminalSymbol.ConjOp), 
                new RewriteRule(NonTerminalSymbol.Ops,		NonTerminalSymbol.SV,   NonTerminalSymbol.ConjOp), 
                new RewriteRule(NonTerminalSymbol.Ops,		NonTerminalSymbol.SVO,  NonTerminalSymbol.ConjOp), 
                new RewriteRule(NonTerminalSymbol.Ops,		NonTerminalSymbol.VO,   NonTerminalSymbol.ConjOp), 
                new RewriteRule(NonTerminalSymbol.ConjOp,	NonTerminalSymbol.Conj, NonTerminalSymbol.V),
                new RewriteRule(NonTerminalSymbol.ConjOp,	NonTerminalSymbol.Conj, NonTerminalSymbol.SV), 
                new RewriteRule(NonTerminalSymbol.ConjOp,	NonTerminalSymbol.Conj, NonTerminalSymbol.SVO), 
                new RewriteRule(NonTerminalSymbol.ConjOp,	NonTerminalSymbol.Conj, NonTerminalSymbol.VO), 
                new RewriteRule(NonTerminalSymbol.ConjOp,	NonTerminalSymbol.ConjOp, NonTerminalSymbol.ConjOp), 

				// define an imperative function
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.body), 
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.V),
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.SV), 
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.SVO), 
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.VO),
                new RewriteRule(NonTerminalSymbol.DeFun,	NonTerminalSymbol.tVO, NonTerminalSymbol.Ops), 

				// invokes a relation-struct
				new RewriteRule(NonTerminalSymbol.SV,		NonTerminalSymbol.NP, NonTerminalSymbol.V),		// 1 param
                new RewriteRule(NonTerminalSymbol.SV,		NonTerminalSymbol.NP, NonTerminalSymbol.VP),	// 1 param
                new RewriteRule(NonTerminalSymbol.SV,		NonTerminalSymbol.NP, NonTerminalSymbol.G),		// 1 param of type parameterless-function
                new RewriteRule(NonTerminalSymbol.SV,		NonTerminalSymbol.NP, NonTerminalSymbol.aGP),	// 1 param of type function
                new RewriteRule(NonTerminalSymbol.SVO,		NonTerminalSymbol.SV, NonTerminalSymbol.NP),	// 2 params incl. direct obj
                new RewriteRule(NonTerminalSymbol.SVO,		NonTerminalSymbol.SV, NonTerminalSymbol.PP),	// 2 params
                new RewriteRule(NonTerminalSymbol.SVO,		NonTerminalSymbol.SV, NonTerminalSymbol.NPPP),	// 3+ params

				// invoke a relation-func
                new RewriteRule(NonTerminalSymbol.VO,		NonTerminalSymbol.V,  NonTerminalSymbol.NP),	// 1 param incl. direct obj
                new RewriteRule(NonTerminalSymbol.VO,		NonTerminalSymbol.V,  NonTerminalSymbol.PP),	// 1 param
                new RewriteRule(NonTerminalSymbol.VO,		NonTerminalSymbol.V,  NonTerminalSymbol.G),		// 1 param of type parameterless-function
                new RewriteRule(NonTerminalSymbol.VO,		NonTerminalSymbol.V,  NonTerminalSymbol.aGP),	// 1 param of type function
                new RewriteRule(NonTerminalSymbol.VO,		NonTerminalSymbol.V,  NonTerminalSymbol.NPPP),	// 2+ params

				// list of PPs, list of PP headed by a NP called the direct object. Mixed determinate/indeterminate is a partially-applied function
                new RewriteRule(NonTerminalSymbol.aPP,		NonTerminalSymbol.aPP,	NonTerminalSymbol.aPP), 
                new RewriteRule(NonTerminalSymbol.aNPPP,	NonTerminalSymbol.aNP,	NonTerminalSymbol.aPP), 
                new RewriteRule(NonTerminalSymbol.PP,		NonTerminalSymbol.PP,	NonTerminalSymbol.PP), 
                new RewriteRule(NonTerminalSymbol.NPPP,		NonTerminalSymbol.NP,	NonTerminalSymbol.PP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.NP,	NonTerminalSymbol.aPP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.aNP,	NonTerminalSymbol.PP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.PP,	NonTerminalSymbol.aPP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.aPP,	NonTerminalSymbol.PP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.paF,	NonTerminalSymbol.aPP), 
                new RewriteRule(NonTerminalSymbol.paF,		NonTerminalSymbol.paF,	NonTerminalSymbol.PP), 

				// gerund phrase pieces; 0 params are in UnitRules
                new RewriteRule(NonTerminalSymbol.aNP,	NonTerminalSymbol.G, NonTerminalSymbol.aNP),	// 1 param
                new RewriteRule(NonTerminalSymbol.aNP,	NonTerminalSymbol.G, NonTerminalSymbol.aPP),	// 1+ params
                new RewriteRule(NonTerminalSymbol.aNP,	NonTerminalSymbol.G, NonTerminalSymbol.aNPPP),	// 2+ params
                new RewriteRule(NonTerminalSymbol.NP,	NonTerminalSymbol.G, NonTerminalSymbol.NP),		// 1 param
                new RewriteRule(NonTerminalSymbol.NP,	NonTerminalSymbol.G, NonTerminalSymbol.PP),		// 1+ params
                new RewriteRule(NonTerminalSymbol.NP,	NonTerminalSymbol.G, NonTerminalSymbol.NPPP),	// 2+ params
                new RewriteRule(NonTerminalSymbol.NP,	NonTerminalSymbol.G, NonTerminalSymbol.paF),	// 
                new RewriteRule(NonTerminalSymbol.aGP,	NonTerminalSymbol.G, NonTerminalSymbol.aNP),	// 1 param
                new RewriteRule(NonTerminalSymbol.aGP,	NonTerminalSymbol.G, NonTerminalSymbol.aPP),	// 1+ params
                new RewriteRule(NonTerminalSymbol.aGP,	NonTerminalSymbol.G, NonTerminalSymbol.aNPPP),	// 2+ params
                new RewriteRule(NonTerminalSymbol.GP,	NonTerminalSymbol.G, NonTerminalSymbol.NP),		// 1 param
                new RewriteRule(NonTerminalSymbol.GP,	NonTerminalSymbol.G, NonTerminalSymbol.PP),		// 1+ params
                new RewriteRule(NonTerminalSymbol.GP,	NonTerminalSymbol.G, NonTerminalSymbol.NPPP),	// 2+ params
                new RewriteRule(NonTerminalSymbol.GP,	NonTerminalSymbol.G, NonTerminalSymbol.paF),	// 

				// relative clauses with the relative pronoun (Rp) "which"
                new RewriteRule(NonTerminalSymbol.NP, NonTerminalSymbol.NP, NonTerminalSymbol.RC),
                new RewriteRule(NonTerminalSymbol.RC, NonTerminalSymbol.Rp, NonTerminalSymbol.SV),
                new RewriteRule(NonTerminalSymbol.RC, NonTerminalSymbol.Rp, NonTerminalSymbol.SVO),
                new RewriteRule(NonTerminalSymbol.RC, NonTerminalSymbol.Rp, NonTerminalSymbol.VO),

				// basic preposition pieces; determinate & indeterminate
                new RewriteRule(NonTerminalSymbol.PP, NonTerminalSymbol.P, NonTerminalSymbol.NP),
                new RewriteRule(NonTerminalSymbol.aPP,NonTerminalSymbol.P, NonTerminalSymbol.aNP),

                // basic noun pieces; determinate & indeterminate forms of each
                new RewriteRule(NonTerminalSymbol.NP, NonTerminalSymbol.The,NonTerminalSymbol.N ),
                new RewriteRule(NonTerminalSymbol.NP, NonTerminalSymbol.The,NonTerminalSymbol.AdN),
                new RewriteRule(NonTerminalSymbol.aNP,NonTerminalSymbol.a,  NonTerminalSymbol.N ),
                new RewriteRule(NonTerminalSymbol.aNP,NonTerminalSymbol.a,  NonTerminalSymbol.AdN),
                new RewriteRule(NonTerminalSymbol.AdN,NonTerminalSymbol.Adj,NonTerminalSymbol.N ),
                new RewriteRule(NonTerminalSymbol.N,  NonTerminalSymbol.N,  NonTerminalSymbol.N ), // nouns(types) can be multi-word

				// basic verb pieces
                new RewriteRule(NonTerminalSymbol.IV, NonTerminalSymbol.To, NonTerminalSymbol.V), // to find a person: infinitive phrase as adverbial phrase 
                new RewriteRule(NonTerminalSymbol.VP, NonTerminalSymbol.HV, NonTerminalSymbol.G), // is going
                new RewriteRule(NonTerminalSymbol.V,  NonTerminalSymbol.V,  NonTerminalSymbol.Adv),	// absorb adverbs
                new RewriteRule(NonTerminalSymbol.V,  NonTerminalSymbol.Adv,NonTerminalSymbol.V),	// absorb adverbs

				// allow the Oxford comma
                new RewriteRule(NonTerminalSymbol.Conj, NonTerminalSymbol.comma, NonTerminalSymbol.Conj),
            };
		public static readonly char[] digits = { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' };
		public static readonly short ascii0 = (short)'0';
		public static readonly UnitRule[] UR = {
                new UnitRule(NonTerminalSymbol.G  , s => s.EndsWith("ing") && s != t.Nothing && s != t.Anything && s != t.Something),
                new UnitRule(NonTerminalSymbol.NP, s => (0 <= (short)s[0] - ascii0) && ((short)s[0] - ascii0 <= 9)),
                new UnitRule(NonTerminalSymbol.V,"is"),
                new UnitRule(NonTerminalSymbol.V,"are"),
                new UnitRule(NonTerminalSymbol.HV,"is"),
                new UnitRule(NonTerminalSymbol.HV,"was"),
                new UnitRule(NonTerminalSymbol.HV,"am"),
                new UnitRule(NonTerminalSymbol.HV,"are"),
                new UnitRule(NonTerminalSymbol.HV,"were"),
                new UnitRule(NonTerminalSymbol.IsHas,"is"),
                new UnitRule(NonTerminalSymbol.IsHas,"am"),
                new UnitRule(NonTerminalSymbol.IsHas,"are"),
                new UnitRule(NonTerminalSymbol.IsHas,"has"),
                new UnitRule(NonTerminalSymbol.IsHas,"have"),

                // for examples only
                new UnitRule(NonTerminalSymbol.V,"reads"),
                new UnitRule(NonTerminalSymbol.V,"change"),
                new UnitRule(NonTerminalSymbol.V,"say"),
                new UnitRule(NonTerminalSymbol.V,"give"),
                new UnitRule(NonTerminalSymbol.V,"gave"),
                new UnitRule(NonTerminalSymbol.V,"keeps"),
                new UnitRule(NonTerminalSymbol.V,"draw"),
                new UnitRule(NonTerminalSymbol.V,"do"),
                new UnitRule(NonTerminalSymbol.V,"begins"), // reserved word?
                new UnitRule(NonTerminalSymbol.V,"begin"), // reserved?
                new UnitRule(NonTerminalSymbol.V,"ends"), // reserved word?
                new UnitRule(NonTerminalSymbol.V,"end"), // reserved?

                // base types, built-in types
                new UnitRule(NonTerminalSymbol.aNP, t.Anything),
                new UnitRule(NonTerminalSymbol.aNP, t.Something),
                new UnitRule(NonTerminalSymbol.aNP, t.Nothing),
                new UnitRule(NonTerminalSymbol.NP, t.Nothing),
                new UnitRule(NonTerminalSymbol.aNP, t.Someone),
                new UnitRule(NonTerminalSymbol.N, t.Someone),
                new UnitRule(NonTerminalSymbol.N, t.Number),
                new UnitRule(NonTerminalSymbol.N, t.Percentage),
                new UnitRule(NonTerminalSymbol.N, t.Money),
                new UnitRule(NonTerminalSymbol.N, t.Position),
                new UnitRule(NonTerminalSymbol.N, t.Boole),
                new UnitRule(NonTerminalSymbol.N, t.Time),
                new UnitRule(NonTerminalSymbol.N, t.Text),
                new UnitRule(NonTerminalSymbol.N, t.Sequence),
                new UnitRule(NonTerminalSymbol.Adj, t.Numeric),
                new UnitRule(NonTerminalSymbol.Adj, t.Percent),
                new UnitRule(NonTerminalSymbol.Adj, t.Monetary),
                new UnitRule(NonTerminalSymbol.Adj, t.Ordinal),
                new UnitRule(NonTerminalSymbol.Adj, t.Boolean),
                new UnitRule(NonTerminalSymbol.Adj, t.Temporal),
                new UnitRule(NonTerminalSymbol.Adj, t.Textual),
                new UnitRule(NonTerminalSymbol.Adj, t.Sequential),

				// functor words
				new UnitRule(NonTerminalSymbol.Adv, "here"),
				new UnitRule(NonTerminalSymbol.Rp,"which"),
                new UnitRule(NonTerminalSymbol.P,"with"),
                new UnitRule(NonTerminalSymbol.P,"about"),
                new UnitRule(NonTerminalSymbol.P,"at"),
                new UnitRule(NonTerminalSymbol.P,"toward"),
                new UnitRule(NonTerminalSymbol.P,"to"),
                new UnitRule(NonTerminalSymbol.To,"to"),
                new UnitRule(NonTerminalSymbol.P,"by"),
                new UnitRule(NonTerminalSymbol.colon,"by"),
                new UnitRule(NonTerminalSymbol.colon,"via"),
                new UnitRule(NonTerminalSymbol.a,"a"),
                new UnitRule(NonTerminalSymbol.a,"an"),
                new UnitRule(NonTerminalSymbol.a,"many"),
                new UnitRule(NonTerminalSymbol.a,"several"),
                new UnitRule(NonTerminalSymbol.The,"the"),
                new UnitRule(NonTerminalSymbol.The,"each"),
                new UnitRule(NonTerminalSymbol.The,"every"),
                new UnitRule(NonTerminalSymbol.colon,":"),
                new UnitRule(NonTerminalSymbol.colon,","), // anywhere you can use a colon, you can use a comma
                new UnitRule(NonTerminalSymbol.comma,","),
                new UnitRule(NonTerminalSymbol.Conj,","),
                new UnitRule(NonTerminalSymbol.Conj,"then"),
                new UnitRule(NonTerminalSymbol.Conj,"and"),
                new UnitRule(NonTerminalSymbol.Conj,"either"),
                new UnitRule(NonTerminalSymbol.Conj,"or"),
                new UnitRule(NonTerminalSymbol.SConj,"before"),
                new UnitRule(NonTerminalSymbol.SConj,"after"),
                new UnitRule(NonTerminalSymbol.SConj,"until"),
                new UnitRule(NonTerminalSymbol.SConj,"unless"),
                new UnitRule(NonTerminalSymbol.SConj,"if"),
                new UnitRule(NonTerminalSymbol.SConj,"since"),
                new UnitRule(NonTerminalSymbol.SConj,"when"),
                new UnitRule(NonTerminalSymbol.SConj,"whenever"),
                new UnitRule(NonTerminalSymbol.SConj,"while"),
            };

		public ParseForest CYK(string str)
		{
			//let the input be a string  a  consisting of n words: a1 ... an.
			string[] a = str.ToLowerInvariant().Replace(",", " , ").Replace(":", " : ").Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
			int n = a.Length;
			//let the grammar contain r nonterminal symbols R1 ... Rr. The set of start symbols Rs is included in R.
			int r = (int)NonTerminalSymbol.Length;
			//let P[n,n,r] be an array of booleans. Initialize all elements of P to false.
			ParseTreeNode[, ,] P = new ParseTreeNode[n, n, r];// [word#, altitude of pyramid, NonTerminalSymbol]

			// CYK ///////////////////////////////////////////////////////
			foreach (int i in 1.to(n))
			{
				int numTrues = UR.Length;
				foreach (UnitRule Rj in UR) // find the type of each word
				{
					if (Rj.TerminalSymbol == null)
						P[i, 0, (int)Rj.headterm] = new ParseTreeNode(Rj.TypeRule(a[i])); // this part's my addition: numbers, -ing words
					else if (Rj.TerminalSymbol == a[i])
						P[i, 0, (int)Rj.headterm].match = true;
					if (P[i, 0, (int)Rj.headterm].match == false) // count #/matches
						numTrues--;
				}
				if (numTrues == 0) // then assume its any & all types that a single word can possibly be
					foreach (NonTerminalSymbol type in unknownWords)
						P[i, 0, (int)type].match = true;
			}
			foreach (int i in 2.to(n))  // Length of span
				foreach (int j in 1.to(n - i))  // Start of span
					foreach (int k in 1.to(i))  // Partition of span
						foreach (RewriteRule Ra in R) // foreach non-unit rule
							if (P[j, k, (int)Ra.term2].match && P[j + k + 1, i - k - 1, (int)Ra.term3].match)
								P[j, i, (int)Ra.headterm] = new ParseTreeNode(true, k, Ra.term2, Ra.term3, P[j, i, (int)Ra.headterm].list);
			int validParsings = 0; //if any of P[1,n,x] is true (x is iterated over all the indices for Rstart)
			foreach (int x in (int[])Enum.GetValues(typeof(Rs)))
				if (P[0, n - 1, x].match)
					validParsings++;
			///////////////////////////////////////////////////////////////

			return new ParseForest { P = P, n = n, r = r, a = a, Count = validParsings };
		}

		#region printing and self-checking

		bool bp, py, rc;
		public void debug(bool pyramid = false, bool rulecheck = false, bool backpointers = false)
		{
			py = pyramid; rc = rulecheck; bp = backpointers;
		}

		public void PrintBackpointerData(ParseForest tree)
		{
			if (!bp) return;
			ParseTreeNode[, ,] P = tree.P;
			int n = tree.n, r = tree.r;

			for (int k = n - 1; k >= 0; k--)
			{
				foreach (int i in 1.to(n - k))
				{
					"\t".LogAnd();
					string retval = "";
					foreach (int nonterminals in 1.to(r))
						if (P[i, k, nonterminals].match)
						{
							int c = 0;
							for (ParseTreeNodeMatch m = P[i, k, nonterminals].list; m != null; m = m.next)
								c++;
							retval += (retval == "" ? "" : ",") + c;
						}
					retval.LogAnd();
				}
				"".Log();
			}
			// final line: words
			foreach (int i in 1.to(n))
				("\t" + tree.a[i]).LogAnd();
			"".Log();
		}

		public void PrintPyramid(ParseForest tree, bool force = false)
		{
			if (!py && !force) return;
			SyntaxParser.PrintPyramid(tree);
		}

		public static void PrintPyramid(ParseForest tree)
		{
//			if (!force) return;
			ParseTreeNode[, ,] P = tree.P;
			int n = tree.n, r = tree.r;

			for (int k = n - 1; k >= 0; k--)
			{
				foreach (int i in 1.to(n - k))
				{
					"\t".LogAnd();
					string retval = "";
					foreach (int nonterminals in 1.to(r))
					{
						NonTerminalSymbol nt = (NonTerminalSymbol)nonterminals;
						if (P[i, k, nonterminals].match && nt != NonTerminalSymbol.comma)
							retval += (retval == "" ? "" : ",") + (nt == NonTerminalSymbol.colon ? ":" : nt.ToString());
					}
					(retval.Length > 10 ? "*" : retval).LogAnd();
				}
				"".Log();
			}
			foreach (int i in 1.to(n))
				("\t" + tree.a[i]).LogAnd();
			"".Log();

			// is valid?
			if (tree.Count == 0)
				"".Log();//"is NOT a member of language".Log();
			else if (tree.Count == 1)
				"IS a member of language as a ".Log(tree.SentenceType.ToString());
			else
				"is a member of language but ambiguous, with".Log(tree.Count + " interpretations");
		}

		public void RuleCheck()
		{
			if (!rc) return;
			// check rules 
			int[] defined = new int[1 + (int)NonTerminalSymbol.Length];
			int[] used = new int[1 + (int)NonTerminalSymbol.Length];

			// if its a "start" symbol (more likely a finish symbol), it is used
			foreach (int x in (int[])Enum.GetValues(typeof(Rs)))
				used[x]++;
			// if it types an unknown word, it is used
			foreach (NonTerminalSymbol nt in unknownWords)
			{
				defined[(int)nt]++;
				used[(int)nt]++;
			}
			foreach (UnitRule x in UR)
			{
				defined[(int)x.headterm]++;
				used[(int)x.headterm]++;
			}
			foreach (RewriteRule x in R)
			{
				defined[(int)x.headterm]++;
				used[(int)x.term2]++;
				used[(int)x.term3]++;
			}
			foreach (int x in (int[])Enum.GetValues(typeof(NonTerminalSymbol)))
			{
				if ((NonTerminalSymbol)x == NonTerminalSymbol.Length) break;
				if (defined[x] == 0) "undefined:".Log(((NonTerminalSymbol)x).ToString());
				if (used[x] == 0) "unused:".Log(((NonTerminalSymbol)x).ToString());
			}
		}

		#endregion
	}
}