using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

namespace Complish
{
	public class Complish
	{
		public DataSegment DataSegment;
		public SyntaxParser SyntaxParse;
		public SemanticChecks SemanticChecker;

		public Complish()
		{
			SyntaxParse = new SyntaxParser();
			SyntaxParse.debug();
			SyntaxParse.RuleCheck();
			t.Initialize();
			Verbs.Initialize();
			Scope.Initialize();
			DataSegment = new DataSegment();
			SemanticChecker = new SemanticChecks();
		}

		public void Compile(List<string> input)
		{
			var sentences = new List<ParseForest>();
			foreach (var sentence in input)
			{
				var sentence2 = DataSegment.LiftLiteralStrings(sentence);
				//sentence2.Log("");
				sentences.Add(SyntaxParse.Sentence(sentence2));
			}

			Symbol imperativeFuncsSpanSentences = null;
			foreach (ParseForest sentence in sentences)
			{
				//string.Join(" ",sentence.a).Log();
				//sc.PrintAST(sentence);
				imperativeFuncsSpanSentences = SemanticChecker.CreateTypes(sentence, imperativeFuncsSpanSentences);
				//"".Log();
			}

			"".Log();

			foreach (Scope scope in Scope.All)
			{
				"\n==".Log(scope + " =====");
				foreach (Symbol s in scope.symbols1.Values)
					s.Name.Log("(" + s.PartOfSpeech + "): A " + s.Category + " of type " + s.Type);
			}

			"".Log();
			"String Table".Log();
			var i = 0;
			foreach (string literalString in DataSegment.LiteralStrings)
				(DataSegment.LitStringPlaceholderPrefix + (i++) + ":").Log(literalString);

			Console.ReadLine();
		}
	}

	public static class Program
	{
		public static readonly string outfilename = "complish." + DateTime.Now.ToFileTime() + ".txt";

		public static void Main(string[] args)
		{
			File.Delete(outfilename);
			var input = new List<string> {
				"To draw giving, do nothing",
				"to draw giving a number to a number, do nothing",
				"say",
				"To give a percentage to a number do nothing",
				"To say, give 10% to 21, give 10% to 21",
				"say",
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
				"a buggy is many wheel and a numeric rank",
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
				"When a function reads a variable, change the variable to anything before invoking the function"
			};
			new Complish().Compile(input);
		}

		// ExtensionMethods /////////////////////////

		public static string OrEmpty<T>(this Dictionary<T, string> dict, T key)
		{
			return dict.ContainsKey(key) ? dict[key] : "";
		}
		public static T OrKey<T>(this Dictionary<T, T> dict, T key)
		{
			return dict.ContainsKey(key) ? dict[key] : key;
		}
		public static V OrNull<K,V>(this Dictionary<K, V> dict, K key) where V:class
		{
			return dict.ContainsKey(key) ? dict[key] : null;
		}
		public static T And<T>(this List<T> l, T item) where T : class
		{
			if (item == null) return null;
			l.Add(item);
			return item;
		}
		public static void Log(this string s, params object[] t)
		{
			//Console.WriteLine(s + (" " + (t ?? "").ToString()).TrimStart());
			//File.AppendAllText(outfilename, s + " " + (t ?? "") + Environment.NewLine);
			File.AppendAllText(outfilename, s);
			foreach (var obj in t)
				if (obj != null)
					File.AppendAllText(outfilename, " " + obj);
			File.AppendAllText(outfilename, Environment.NewLine); 
		}
		public static void Log(this string s, string t = null)
		{
			//Console.WriteLine(s + (" " + (t ?? "").ToString()).TrimStart());
			File.AppendAllText(outfilename, s + " " + (t ?? "") + Environment.NewLine);
		}
		public static void LogAnd(this string s, string t = "")
		{
			//Console.Write(s + (" " + t).TrimStart());
			File.AppendAllText(outfilename, s + (" " + t).TrimStart());
		}
		public static void Throw(this string s)
		{
			throw new Exception(s);
		}
		public static IEnumerable<int> to(this int from, int to)
		{
			return Enumerable.Range(from - 1, to - from + 1);
		}
	}

	public class StopUsing : IDisposable
	{
		public Action End = () => { };
		public StopUsing(Action onEnd) { End = onEnd; }
		bool disposed = false;
		public void Dispose()
		{
			Dispose(true);
			GC.SuppressFinalize(this);
		}
		protected virtual void Dispose(bool disposing)
		{
			if (disposed) return;
			if (disposing) End();
			disposed = true;
		}
	}

	public class Backtrack : Exception
	{
		public Backtrack(string msg) : base(msg)
		{
		}
	}
}