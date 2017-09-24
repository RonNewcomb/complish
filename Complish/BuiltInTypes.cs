using System.Collections.Generic;

namespace Complish
{
	public static class t // built-in types
	{
		public const string Someone = "someone";
		public const string Numeric = "numeric";
		public const string Number = "number";
		public const string Textual = "textual";
		public const string Text = "text";
		public const string Monetary = "monetary";
		public const string Money = "money";
		public const string Percentage = "percentage";
		public const string Percent = "percent";
		public const string Ordinal = "ordinal";
		public const string Position = "position";
		public const string Boole = "boole";
		public const string Boolean = "boolean";
		public const string Temporal = "temporal";
		public const string Time = "time";
		public const string Sequential = "sequential";
		public const string Sequence = "sequence";
		public const string Anything = "anything";
		public const string Something = "something";
		public const string Nothing = "nothing";
		public const string Somebody = "somebody";

		public static Dictionary<string, string> AdjToNounTypes = new Dictionary<string, string>() 
		{
			{t.Numeric,	t.Number},
            {t.Percent, t.Percentage},
			{t.Monetary,t.Money},
			{t.Ordinal,	t.Position},
			{t.Boolean,	t.Boole},
			{t.Temporal,t.Time},
			{t.Textual,	t.Text},
			{t.Sequential,t.Sequence},
			{t.Somebody,t.Someone},// HACK
		};

		public static Dictionary<string, string> ParentTypeOf = new Dictionary<string, string>()
		{
			{t.Anything,	t.Anything},
			{t.Nothing,		t.Anything},
			{t.Something,	t.Anything},
			{t.Someone,		t.Something},
			{t.Text,		t.Something},
			{t.Sequence,	t.Something},
			{t.Number,		t.Something},
			{t.Percentage,	t.Number},
			{t.Money,		t.Number},
			{t.Position,	t.Number},
			{t.Boole,		t.Number},
			{t.Time,		t.Number},
		};

		/// <summary>Distance of 0 means same exact type. Distance of 1 means one's a direct parent. Etc.
		/// Returns negative if the child isn't a subclass of (or equal to) the parent.</summary>
		public static int Distance(string from, string toParent = t.Anything)
		{
			int distance = 0;
			toParent = AdjToNounTypes.OrKey(toParent);
			for (from = AdjToNounTypes.OrKey(from); from != toParent && from != t.Anything; distance++)
				from = ParentTypeOf[from];
			return (from != toParent) ? -42 : distance; 
		}

		/// <summary> Recognizes dollars and percents, numbers and ordinals. </summary>
		public static Symbol AsNumber(string input)
		{
			bool hasDollar = input.Contains("$");
			bool hasPercent = input.Contains("%");
			input = input.Replace("%", "").Replace("$", "").Replace(",", "");
			float outputFloat;
			if (float.TryParse(input, out outputFloat))
				return new Symbol()
				{
					Name = input,
					Type = hasDollar ? t.Money : hasPercent ? t.Percent : t.Number, 
					Category = Categories.Variable,
					PartOfSpeech = NonTerminalSymbol.N,
				};
			// ordinal?
			if (input.Length == 0) return null;
			char ch = input[0];
			if (ch < '0' || ch > '9') return null;
			int i = 0, retval = ch - '0';
			while (++i < input.Length)
			{
				ch = input[i];
				if (ch < '0' || ch > '9') break;
				retval = (retval * 10) + (ch - '0');
			}
			if (input.Length >= i) return null;
			string suffix = input.Substring(i, 2);
			if (OrdinalSuffixes.Contains(suffix))
				return new Symbol()
				{
					Name = input,
					Type = t.Position,
					Category = Categories.Variable,
					PartOfSpeech = NonTerminalSymbol.N,
				};
			return null;
		}

		/// <summary>Searches for constructions of the form "the TYPE which", as these indicate the beginning of a relative clause.
		/// Use only when parsing invocations, not definitions. </summary>
		//public static theTypeWhich IsNameOfTypeWhich(List<string> words)
		//{
		//	int savedIndex = index;
		//	theTypeWhich theType = new theTypeWhich { preposition = "" };
		//	theType.type = InheritanceTree.SingleOrDefault(itype => Match(words, itype.name));
		//	if (theType.type == null || index >= words.Count)
		//	{
		//		index = savedIndex;
		//		return null;
		//	}
		//	if (Contains<RelativePronouns>(words[index]))
		//	{
		//		index++;
		//		return theType;
		//	}
		//	if (stringnums.prepositions.Contains(words[index]) && Contains<RelativePronouns>(words[index + 1]))
		//	{
		//		theType.preposition = words[index];
		//		index += 2;
		//		return theType;
		//	}
		//	index = savedIndex;
		//	return null;
		//}

		public static void Initialize()
		{
			//UnitsOfMeasureParsers.Add(IsPercent);
			//UnitsOfMeasureParsers.Add(IsOrdinal);
			//for(long i = 0; i < 23; i++)
			//	Console.WriteLine("{0}: {1}",i, NumberToSpelledOutOrdinal(i));
			//Console.WriteLine("{0}: {1}", 100, NumberToSpelledOutOrdinal(100));
			//Console.WriteLine("{0}: {1}", 569, NumberToSpelledOutOrdinal(569));
			//Console.WriteLine("{0}: {1}", 1000, NumberToSpelledOutOrdinal(1000));
			//Console.WriteLine("{0}: {1}", 2435, NumberToSpelledOutOrdinal(2435));
			//Console.WriteLine("{0}: {1}", 200456, NumberToSpelledOutOrdinal(200456));
			//Console.WriteLine("{0}: {1}", 213456, NumberToSpelledOutOrdinal(213456));
			//Console.WriteLine("{0}: {1}", 654213456, NumberToSpelledOutOrdinal(654213456));
			//Console.WriteLine("{0}: {1}", 700654213456, NumberToSpelledOutOrdinal(700654213456));
			//Console.WriteLine("{0}: {1}", 103700654213456, NumberToSpelledOutOrdinal(103700654213456));
			//Console.WriteLine("{0}: {1}", 999103700654213412, NumberToSpelledOutOrdinal(999103700654213412));
		}

		static readonly List<string> OrdinalSuffixes = new List<string> { "th", "st", "nd", "rd" };
		static readonly List<string> SpelledOutNumbers = new List<string> { "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen" };
		static readonly List<string> SpelledOutTens = new List<string> { "zeroes", "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety" };
		static readonly List<string> SpelledOutPowersOfTen = new List<string> { "a", "thousand", "million", "billion", "trillion", "quadrillion", "quintillion" };
		static readonly List<string> Ordinals = new List<string> { "zeroth", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth" };
		
		///// <summary> Although "one hundred and two" is bad grammar, it appears frequently. But if an And just happens to trail a
		///// number without being part of it, this flags it. </summary>
		//public static bool AteTheWordAnd = false;

		//public static string numtype = t.Nothing;

		///// <summary>Parses spelled-out numbers and ordinals like "thirty two thousand four hundred fifty-first"</summary>
		//public static long? SpelledOutOrdinalToNumber(List<string> words)
		//{
		//	long? total = null;
		//	string word = "";
		//	int i = 0;
		//	char ch;
		//	string input = words[index];

		//getNewWord:  // I tried a recursive version but it didn't work out.
		//	AteTheWordAnd = (word == "and"); // initialize & reset
		//	if (total != null) input = words[index++];
		//	if (numtype == "TentativelyOrdinal") numtype = t.Ordinal;

		//	// begin
		//	i = -1;
		//	do
		//	{
		//		i++;
		//		ch = input.ElementAt(i);
		//	} while (ch >= 'a' && ch <= 'z' && i < input.Length - 1);
		//	if (i < 1)
		//		return total;
		//	// if we read it something that wasn't a word, stop already and return what, if anything, we already got.

		//	word = input.Substring(0, i);

		//retry: // if none of the defined words match, we'll modify the word suffix and retry. There's 2 strategies.

		//	if (Ordinals.Contains(word))
		//	{
		//		if (total == null) total = 0;
		//		total += Ordinals.IndexOf(word);
		//		numtype = t.Ordinal;
		//		goto getNewWord;
		//	}
		//	if (SpelledOutNumbers.Contains(word))
		//	{
		//		if (total == null) total = 0;
		//		total += SpelledOutNumbers.IndexOf(word);
		//		goto getNewWord;
		//	}
		//	if (SpelledOutTens.Contains(word))
		//	{
		//		if (total == null) total = 0;
		//		total += SpelledOutTens.IndexOf(word) * 10;
		//		goto getNewWord;
		//	}
		//	if (word == "hundred" || SpelledOutPowersOfTen.Contains(word))
		//	{
		//		if (total == null) total = 1;
		//		long power = (word == "hundred") ? 100 : (long)Math.Pow(10, 3 * SpelledOutPowersOfTen.IndexOf(word));
		//		if (total < power)
		//			total *= power;
		//		else
		//		{
		//			long subhundred = total.Value % 100;
		//			total = total - subhundred + subhundred * power;
		//		}
		//		goto getNewWord;
		//	}

		//	// If we reach here, we don't know the word.  
		//	// Or do we? Perhaps if we played suffix games, we might recognize it after all.
		//	if (word.EndsWith("tieth"))
		//	{
		//		numtype = "TentativelyOrdinal";
		//		word = word.Replace("tieth", "ty");
		//		goto retry;
		//	}
		//	if (word.EndsWith("th"))
		//	{
		//		numtype = "TentativelyOrdinal";
		//		word = word.Substring(0, word.Length - 2);
		//		goto retry;
		//	}
		//	if (word == "and")
		//		goto getNewWord;

		//	// If we found at least one numeric word, we keep GOTOing until we eventually finish all the words in the phrase.

		//	if (AteTheWordAnd)
		//	{
		//		index--;            // TODO oops!  backtrack the index over this word!!
		//	}

		//	// Maybe it's a unit of measure word? If so, this ends it anyway.
		//	index += ParseAnyUnitsOfMeasure(words, i);

		//	if (numtype == "TentativelyOrdinal") numtype = t.Number;
		//	return total;
		//}

		#region output

		/// <summary> Output. Creates the ordinal words for a passed-in number.</summary>
		public static string NumberToSpelledOutOrdinal(long Nth)
		{
			string answer = NumberToSpelledOutWords(Nth);
			if (answer == "") return "zeroth";
			int i = answer.LastIndexOfAny(new[] { ' ', '-' });
			string lastWord = answer.Substring(i + 1);
			if (SpelledOutNumbers.Contains(lastWord))
			{
				int j = SpelledOutNumbers.IndexOf(lastWord);
				if (j < 13) return answer.Substring(0, i + 1) + Ordinals[j];
			}
			else if (SpelledOutTens.Contains(lastWord))
			{
				int j = SpelledOutTens.IndexOf(lastWord);
				return answer.Substring(0, answer.Length - 2) + "ieth";
			}
			return answer + "th";
		}

		/// <summary>Output. Chooses and returns the correct suffix for its ordinal parameter.</summary>
		public static string th(this int num)
		{
			if (num >= 11 && num <= 13) return "th"; // annoying exception
			return (num % 10 <= 3) ? OrdinalSuffixes[num % 10] : "th";
		}

		/// <summary> Output </summary>
		public static string NumberToSpelledOutWords(long Nth)
		{
			if (Nth == 0) return "zero";
			string answer = (Nth < 0) ? " negative" : "";
			int logBase1000 = 6;
			for (long power = 1000000000000000000; power > 0; power /= 1000, logBase1000--)
				if (Nth >= power)
				{
					int smallN = (int)(Nth / power); // should be a number < 1,000
					if (smallN >= 100)
						answer += " " + SpelledOutNumbers[(smallN / 100)] + " hundred";
					smallN %= 100;
					if (smallN >= 20)
					{
						answer += " " + SpelledOutTens[(smallN / 10)];
						smallN %= 10;
					}
					else
						smallN %= 20;
					if (smallN > 0)
						answer += " " + SpelledOutNumbers[smallN];
					if (logBase1000 > 0)
						answer += " " + SpelledOutPowersOfTen[logBase1000];
					Nth %= power;
				}
			return answer.Substring(1);
		}

		#endregion

	}
}

//enum StandardType { anything = 1, nothing, something, valueType, referenceType, number, percent, money, discrete, boole, position, structure, time, reference, value, homogene, text, list, heterogene, sequence, Object,   /* and always leave as last */ Count };
//enum StandardTypeAdjective { any = 1, no, something, valueType, referenceType, numeric, percentage, monetary, distinct, boolean, ordinal, structured, temporal, referenced, valued, homogeneous, textual, many, heterogeneous, sequential, Objective,/* and always leave as last */ Count };
//enum StandardTypePlural { anythings = 1, nothings, somethings, valueType, referenceType, numbers, percentages, monies, discretion, booles, positions, structures, times, references, values, homogenes, texts, lists, heterogenes, sequences, Objects,  /* and always leave as last */ Count };
//enum OtherParameterTypes { anything = 1, nothing, something }; // "nothing blue" == "something not-blue"; "Nothing's better than world peace" == "world peace is better than everything else"
//enum Article { the, a, many };
//enum Inflections { singular, plural, past, present_participal, past_participal, root, infinitive }; // "is" has 2 extra forms, "am" plus singular/plural past: "was/were"
//enum ListType { bare /*unknown, just commas used*/, things /*and*/, alternatives /*or*/, sequence /*mixed*/, either };
///// <summary>In a multimethod's Signature like "give something to someone" there are two parameters but four terms: verb, noun, preposition, noun. Nouns are parameters, but the others are not. </summary>
//enum PartsOfSpeech { preposition, verb, noun }; // parts of speech of a method signature
///// <summary>"give me liberty" vs. "give liberty to me": the first has 2 parameters without any preposition since the direct object and indirect object swapped places.</summary>
//enum DirectObjectPlacement { not_there_yet, normal, after_the_indirect_object, error }; 
//enum RelativePronouns { that, which, who, whom };

/*class stringnums // enum + string = stringnum
{
    public static string[] EndsInfinitiveDefinition = { ",", ":", "means", "?", "when", };// or any imperative verb, as it begins a clause 
    public static string[] ListSeparators = { ",", "and", "or", "either", "then" };
    public static string[] IndefiniteArticles = { "a", "an", "another" };
    public static string[] ListDeterminers = { "multiple", "many", "several" };
    public static string[] DefiniteArticles = { "the" };
    public static string[] prepositions = { "to", "for", "as", "at", "by", "of", "off", "on" };
    public static string[] InflectionsOfIs = { "is", "are", "was", "being", "been", "am", "be", "were" };
    public static string[] EOL = { ".", "!" }; // but not ? because an answer is expected immediately afterward
    public static string[] QuestionWords = { "what", "when", "which", "where", "would", "could", "should", "can", "will", "shall" };
    public static string[] RelativePronouns = { "that", "which", "who", "whom" };
}

/// <summary>Holds all verbs with all five unique verb forms.  Mostly for testing.  A real implementation would optimize for thousands of verbs.</summary>
class fiveforms : IComparable
{
    public string singular;
    public string plural;
    public string past;
    public string _ing;
    public string _en;
    public fiveforms(string s, string p, string pst, string ing, string en)
    { singular = s; plural = p; past = pst; _ing = ing; _en = en; }
    int IComparable.CompareTo(object f2) { return singular.CompareTo((f2 as fiveforms).singular); }
    public bool Contains(string verb)
    {
        if (verb == singular) return true;
        if (verb == plural) return true;
        if (verb == past) return true;
        if (verb == _ing) return true;
        if (verb == _en) return true;
        return false;
    }
}

/// <summary>
/// This class remembers what a type's name and parent class are. New types defined in a source are appended here.
/// "Subtypes" is, for aggregate types like List, a name of the subtype -- or subtypes, semicolon-separated, as
/// appropriate.  A "list of XXX" is an aggregate, but an object like "car" is not, because the subtypes inside
/// Car aren't listed by its name.</summary>
class InheritedType
{
    public string name;
    public string parent;
    public string subtypes;
    public StandardType typeid;
}

/// <summary>This little construction marks the beginning of a relative clause. "..the Number to which..."</summary>
class theTypeWhich
{
    //public Article art;               // "the"
    public InheritedType type;          // "number"
    public string preposition;          // "to"
    //public string relativePronoun;    // "which.."
    public string say() { return "the " + type.name + ((preposition != "") ? " " + preposition : "") + " which"; }
}

/// <summary> Contains the information for a function parameter, and the names the parameter goes by within the function. 
/// The "StandardType" type acts like a pointer to an InheritedType. This also accepts relationships of types, such as
/// functions, relations, structs, etc., if the parameter is used within the definition of a higher-order function.</summary>
class parameter
{
    public string preposition;
    public string name;
    public Article art;
    public StandardType type;
    public string fullname1;
    public string fullname2;
    public int position;
    public bool identIsAdjectiveTypeIsNoun;
    public parameter(string p, string n, Article a, StandardType t, bool identIsAdj)
    {
        preposition = p; art = a; type = t; fullname1 = null; fullname2 = null; position = 1; identIsAdjectiveTypeIsNoun = identIsAdj;
        name = (identIsAdj) ? (n + " " + t) : (n);
    }

    // the below is for higher-order functions, whose nouns (parameters) are verbs
    public List<term> relation = null;
    public bool isAggregate { get { return relation != null; } }
    /// <summary>Invalid except for isAggregate == true</summary>
    public int prompt;
    public parameter(multimethod subfunction)
    {
        prompt = subfunction.prompt;
        relation = subfunction.signature;
        foreach (var term in relation)
            if (term.which == PartsOfSpeech.verb)
                name = term.verb._ing;
        fullname1 = name;
        fullname2 = name;
    }
}

/// <summary> This informs the assembly language with the distinction of where a value is coming from: 
/// literal which is inlined in the assembly code, 
/// local variable which is on the stack,
/// global which is in the PermanentDataSegment,
/// unbound, meaning we're currying a function and this will be a parameter in the new function,
/// or is the intermediate result returned from an invocation, so may be in a register or whereever.</summary>
enum Indirectedness { unbound, literal, global, local_parameter, nested_invocation }

/// <summary> An instance is a value of a particular type. Usually the term is reserved for objects -- an instance of a class -- but is 
/// used here to refer to values of any type.  5 is an instance of Number, for example. The toAccess property is of type 
/// Indirectedness, an enum explaining if this instance is a literal, like 5 or "hi world", or is in a local variable, etc. </summary>
class instance
{
    public parameter var;
    public Indirectedness toAccess; // literal? get it from a storage location? instanced?
    public long literalValue; // Indirectness.literal, when var.type = number.  Not necessarily a long.
    public string literalString; // Indirectness.literal, when var.type = string
    public invocation inner; // Indirectness.nested_invocation, when var.type = ..invocation
    public StandardType type; // of the provided value -- not necessarily what the signature expects
	//public int creates;
	//public int reads;
	//public int updates;
	//public int deletes;
}

/// <summary>The body of any function/multimethod is a simple list of Invocations. An invocation binds arguments to parameters.</summary>
class invocation
{
    public theTypeWhich which;
    public multimethod definition;
    public List<instance> boundParameters;
    public int startWord;
    public int endWord;
    public invocation(multimethod d, int from, int to, List<instance> bound)
    { definition = d; startWord = from; endWord = to; boundParameters = bound; }
}

/// <summary>The function signature "give something to someone" contains four terms -- verb, noun, preposition, noun -- two of which
/// are also Parameters (the nouns). The property "which" is an enum stating which other propery -- noun, verb, preposition -- is valid.
/// So, a list of terms define a multimethod's Signature.</summary>
class term
{
    public PartsOfSpeech which;
    public string preposition;
    public fiveforms verb;
    public parameter noun;
    public term(string prep) { which = PartsOfSpeech.preposition; preposition = prep; }
    public term(fiveforms v) { which = PartsOfSpeech.verb; verb = v; }
    public term(parameter p, string prepositions) { which = PartsOfSpeech.noun; noun = p; noun.preposition = prepositions; }
    public override string ToString()
    {
        switch (which)
        {
            case PartsOfSpeech.preposition: return preposition;
            case PartsOfSpeech.verb: return verb.singular;
            case PartsOfSpeech.noun: 
                return noun.isAggregate ? noun.relation.ToString(/*true*//*).Replace("(","").Replace(")","") : "a " + noun.name;
        }
        return "???";
    }
}

/// <summary> This remembers a single method's Signature (List of Terms), and the method's Body as, first, an unparsed String, then
/// later as parsed_body (List of Invocations). </summary>
class multimethod
{
    /// <summary>For a function defined as "Someone gives something to someone", there are three parameters (noun phrases)
    /// but five terms (when you include the verb 'gives' and the preposition 'to').</summary>
    public List<term> signature = new List<term>();
    public List<string> body;
    public List<invocation> parsed_body;
    public int prompt = 0;
    public int problems = 0;
    public int todo = 0;
    public bool fully_parsed = false;
    public long distance = 0;
    public int matchingTerms = 0;
    public int called = 0;
    //public string returning; // question word(s)
    public string question;
}

*/
